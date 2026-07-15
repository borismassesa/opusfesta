'use server'

import { revalidatePath } from 'next/cache'
import { requirePermission } from '@/lib/admin-auth'
import { recordAuditEvent } from '@/lib/audit-log'
import { createSupabaseAdminClient } from '@/lib/supabase'
import { isEmailConfigured, sendEmail } from '@/lib/email'
import { getCoupleTier } from '../tier'

// Every mutation here follows the same shape as apps/opus_admin/src/app/(admin)/
// operations/checkin/actions.ts: requirePermission() first, a Supabase
// service-role client (no owner filter — staff act cross-account, scoped
// explicitly by the userId param instead), a { ok, ... } | { ok:false, error }
// return, an audit_log insert on every write, then revalidatePath.

type Result = { ok: true } | { ok: false; error: string }

async function logPledgeAction(args: {
  message: string
  targetResource: string
  userId: string
  eventId?: string | null
  metadata?: Record<string, unknown>
}): Promise<void> {
  await recordAuditEvent({
    eventType: 'opuspass_pledge_admin_action',
    message: args.message,
    targetResource: args.targetResource,
    metadata: { userId: args.userId, eventId: args.eventId ?? null, ...args.metadata },
  })
}

/** Re-verify eligibility server-side before every mutation — never trust
 *  that a userId reaching here came from the list page's own filtering. */
async function assertEligible(userId: string): Promise<void> {
  const tier = await getCoupleTier(userId)
  if (!tier) throw new Error('This couple is not on an Elegant/Signature plan')
}

// ---------------------------------------------------------------- Pledges

export interface PledgeInputAdmin {
  eventId?: string | null
  guestContactId?: string
  full_name?: string
  phone?: string | null
  whatsapp_phone?: string | null
  email?: string | null
  group_tag?: string | null
  pledged_amount?: number
  amount_received?: number
  currency?: string
  promised_date?: string | null
  status?: string
  payment_method?: string | null
  will_attend?: string | null
  card_status?: string
  reminder_cadence?: string
  notes?: string | null
}

function deriveStatus(explicit: string | undefined, pledged: number, received: number): string {
  if (explicit) return explicit
  if (received <= 0) return pledged > 0 ? 'pledged' : 'invited'
  if (received >= pledged && pledged > 0) return 'paid'
  return 'partial'
}

function pledgeColumns(input: PledgeInputAdmin): Record<string, unknown> {
  const pledged = Math.max(0, Number(input.pledged_amount ?? 0))
  const received = Math.max(0, Number(input.amount_received ?? 0))
  return {
    pledged_amount: pledged,
    amount_received: received,
    currency: (input.currency ?? 'TZS').trim() || 'TZS',
    promised_date: input.promised_date || null,
    status: deriveStatus(input.status, pledged, received),
    payment_method: input.payment_method || null,
    will_attend: input.will_attend || null,
    card_status: input.card_status ?? 'none',
    reminder_cadence: input.reminder_cadence ?? 'none',
    notes: input.notes || null,
  }
}

async function resolveContact(
  supabase: ReturnType<typeof createSupabaseAdminClient>,
  userId: string,
  input: PledgeInputAdmin,
): Promise<string> {
  if (input.guestContactId) {
    const { data } = await supabase
      .from('guest_contacts')
      .select('id')
      .eq('id', input.guestContactId)
      .eq('user_id', userId)
      .maybeSingle<{ id: string }>()
    if (!data) throw new Error('Contributor not found')
    return data.id
  }
  const full_name = (input.full_name ?? '').trim()
  if (!full_name) throw new Error("Enter the contributor's name")
  const { data, error } = await supabase
    .from('guest_contacts')
    .insert({
      user_id: userId,
      full_name,
      phone: (input.phone ?? '').trim() || null,
      whatsapp_phone: (input.whatsapp_phone ?? '').trim() || null,
      email: (input.email ?? '').trim() || null,
      group_tag: (input.group_tag ?? '').trim() || null,
    })
    .select('id')
    .single<{ id: string }>()
  if (error || !data) throw new Error(error?.message ?? 'Failed to create contributor')
  return data.id
}

export async function createPledgeAdmin(userId: string, input: PledgeInputAdmin): Promise<Result & { id?: string }> {
  await requirePermission('opuspass.pledges.write')
  try {
    await assertEligible(userId)
    const supabase = createSupabaseAdminClient()
    const guestContactId = await resolveContact(supabase, userId, input)
    const { data, error } = await supabase
      .from('event_pledges')
      .insert({ user_id: userId, guest_contact_id: guestContactId, event_id: input.eventId || null, ...pledgeColumns(input) })
      .select('id')
      .single<{ id: string }>()
    if (error || !data) throw new Error(error?.message ?? 'Failed to create pledge')

    await logPledgeAction({
      message: 'Created a pledge',
      targetResource: `event_pledges:${data.id}`,
      userId,
      eventId: input.eventId,
      metadata: { pledgedAmount: input.pledged_amount ?? 0 },
    })
    revalidatePath(`/opus-pass/pledges/${userId}`)
    return { ok: true, id: data.id }
  } catch (err) {
    return { ok: false, error: err instanceof Error ? err.message : 'Failed to create pledge' }
  }
}

export async function updatePledgeAdmin(userId: string, pledgeId: string, input: PledgeInputAdmin): Promise<Result> {
  await requirePermission('opuspass.pledges.write')
  try {
    await assertEligible(userId)
    const supabase = createSupabaseAdminClient()
    const patch = pledgeColumns(input)
    if (input.guestContactId) {
      ;(patch as Record<string, unknown>).guest_contact_id = await resolveContact(supabase, userId, {
        guestContactId: input.guestContactId,
      })
    }
    if (input.eventId) patch.event_id = input.eventId
    const { error } = await supabase.from('event_pledges').update(patch).eq('id', pledgeId).eq('user_id', userId)
    if (error) throw new Error(error.message)

    await logPledgeAction({
      message: 'Edited a pledge',
      targetResource: `event_pledges:${pledgeId}`,
      userId,
      eventId: input.eventId,
    })
    revalidatePath(`/opus-pass/pledges/${userId}`)
    return { ok: true }
  } catch (err) {
    return { ok: false, error: err instanceof Error ? err.message : 'Failed to update pledge' }
  }
}

/** Record a payment: add to amount_received and re-derive status, same
 *  "compute new total, call update" approach PledgesManager itself uses —
 *  there's no separate record-payment primitive in the couple's own code. */
export async function recordPledgePaymentAdmin(
  userId: string,
  pledgeId: string,
  amount: number,
): Promise<Result> {
  await requirePermission('opuspass.pledges.write')
  try {
    await assertEligible(userId)
    if (!(amount > 0)) throw new Error('Enter a payment amount greater than zero')
    const supabase = createSupabaseAdminClient()
    const { data: pledge } = await supabase
      .from('event_pledges')
      .select('pledged_amount, amount_received')
      .eq('id', pledgeId)
      .eq('user_id', userId)
      .maybeSingle<{ pledged_amount: number; amount_received: number }>()
    if (!pledge) throw new Error('Pledge not found')

    const newReceived = Number(pledge.amount_received) + amount
    const status = deriveStatus(undefined, Number(pledge.pledged_amount), newReceived)
    const { error } = await supabase
      .from('event_pledges')
      .update({ amount_received: newReceived, status, next_reminder_at: status === 'paid' ? null : undefined })
      .eq('id', pledgeId)
      .eq('user_id', userId)
    if (error) throw new Error(error.message)

    await logPledgeAction({
      message: `Recorded a payment of ${amount.toLocaleString('en-US')}`,
      targetResource: `event_pledges:${pledgeId}`,
      userId,
      metadata: { amount, newReceived, status },
    })
    revalidatePath(`/opus-pass/pledges/${userId}`)
    return { ok: true }
  } catch (err) {
    return { ok: false, error: err instanceof Error ? err.message : 'Failed to record payment' }
  }
}

export async function deletePledgeAdmin(userId: string, pledgeId: string): Promise<Result> {
  await requirePermission('opuspass.pledges.write')
  try {
    await assertEligible(userId)
    const supabase = createSupabaseAdminClient()
    const { error } = await supabase.from('event_pledges').delete().eq('id', pledgeId).eq('user_id', userId)
    if (error) throw new Error(error.message)

    await logPledgeAction({ message: 'Deleted a pledge', targetResource: `event_pledges:${pledgeId}`, userId })
    revalidatePath(`/opus-pass/pledges/${userId}`)
    return { ok: true }
  } catch (err) {
    return { ok: false, error: err instanceof Error ? err.message : 'Failed to delete pledge' }
  }
}

// ---------------------------------------------------------------- Guests

export async function createGuestAdmin(
  userId: string,
  input: { full_name: string; phone?: string | null; whatsapp_phone?: string | null; email?: string | null; group_tag?: string | null },
): Promise<Result & { id?: string }> {
  await requirePermission('opuspass.pledges.write')
  try {
    await assertEligible(userId)
    const full_name = input.full_name.trim()
    if (!full_name) throw new Error('Enter a name')
    const supabase = createSupabaseAdminClient()
    const { data, error } = await supabase
      .from('guest_contacts')
      .insert({
        user_id: userId,
        full_name,
        phone: (input.phone ?? '').trim() || null,
        whatsapp_phone: (input.whatsapp_phone ?? '').trim() || null,
        email: (input.email ?? '').trim() || null,
        group_tag: (input.group_tag ?? '').trim() || null,
      })
      .select('id')
      .single<{ id: string }>()
    if (error || !data) throw new Error(error?.message ?? 'Failed to add contributor')

    await logPledgeAction({ message: `Added contributor ${full_name}`, targetResource: `guest_contacts:${data.id}`, userId })
    revalidatePath(`/opus-pass/pledges/${userId}`)
    return { ok: true, id: data.id }
  } catch (err) {
    return { ok: false, error: err instanceof Error ? err.message : 'Failed to add contributor' }
  }
}

export async function updateGuestContactInfoAdmin(
  userId: string,
  guestId: string,
  full_name: string,
  phone: string | null,
  email: string | null,
): Promise<Result> {
  await requirePermission('opuspass.pledges.write')
  try {
    await assertEligible(userId)
    const supabase = createSupabaseAdminClient()
    const { error } = await supabase
      .from('guest_contacts')
      .update({ full_name: full_name.trim(), phone: phone?.trim() || null, email: email?.trim() || null })
      .eq('id', guestId)
      .eq('user_id', userId)
    if (error) throw new Error(error.message)

    await logPledgeAction({ message: 'Edited a contributor', targetResource: `guest_contacts:${guestId}`, userId })
    revalidatePath(`/opus-pass/pledges/${userId}`)
    return { ok: true }
  } catch (err) {
    return { ok: false, error: err instanceof Error ? err.message : 'Failed to edit contributor' }
  }
}

export async function deleteGuestAdmin(userId: string, guestId: string): Promise<Result> {
  await requirePermission('opuspass.pledges.write')
  try {
    await assertEligible(userId)
    const supabase = createSupabaseAdminClient()
    const { error } = await supabase.from('guest_contacts').delete().eq('id', guestId).eq('user_id', userId)
    if (error) throw new Error(error.message)

    await logPledgeAction({ message: 'Removed a contributor', targetResource: `guest_contacts:${guestId}`, userId })
    revalidatePath(`/opus-pass/pledges/${userId}`)
    return { ok: true }
  } catch (err) {
    return { ok: false, error: err instanceof Error ? err.message : 'Failed to remove contributor' }
  }
}

// ---------------------------------------------------------------- Campaign settings

function paymentMethodsToText(methods: { label: string; value: string; name?: string }[]): string {
  return methods
    .filter((m) => m.label?.trim() || m.value?.trim())
    .map((m) => {
      const head = [m.label?.trim(), m.value?.trim()].filter(Boolean).join(': ')
      return m.name?.trim() ? `${head} (${m.name.trim()})` : head
    })
    .join('\n')
}

export async function updateCollectionSettingsAdmin(
  userId: string,
  input: { goalAmount: number | null; paymentMethods: { label: string; value: string; name?: string }[] },
): Promise<Result> {
  await requirePermission('opuspass.pledges.write')
  try {
    await assertEligible(userId)
    const supabase = createSupabaseAdminClient()
    const methods = (input.paymentMethods ?? []).filter((m) => m.label?.trim() || m.value?.trim())
    const patch = {
      pledge_goal_amount: input.goalAmount && input.goalAmount > 0 ? input.goalAmount : null,
      pledge_payment_methods: methods,
      pledge_payment_instructions: paymentMethodsToText(methods) || null,
      updated_at: new Date().toISOString(),
    }
    const { error } = await supabase.from('couple_profiles').update(patch).eq('user_id', userId)
    if (error) throw new Error(error.message)

    await logPledgeAction({ message: 'Edited campaign settings', targetResource: `couple_profiles:${userId}`, userId })
    revalidatePath(`/opus-pass/pledges/${userId}`)
    return { ok: true }
  } catch (err) {
    return { ok: false, error: err instanceof Error ? err.message : 'Failed to save campaign settings' }
  }
}

// ---------------------------------------------------------------- Sending

export interface SendSummaryResult {
  ok: boolean
  sent: number
  failed: number
  skipped: number
  dryRun: boolean
  error?: string
}

function opusPassBase(): { base: string; secret: string } | null {
  const base = process.env.NEXT_PUBLIC_OPUS_PASS_URL
  const secret = process.env.OPUS_PASS_REVALIDATE_SECRET
  if (!base || !secret) return null
  return { base: base.replace(/\/$/, ''), secret }
}

async function callInternalPledgeSend(body: Record<string, unknown>): Promise<SendSummaryResult> {
  const cfg = opusPassBase()
  if (!cfg) return { ok: false, sent: 0, failed: 0, skipped: 0, dryRun: true, error: 'OpusPass connection is not configured' }
  const res = await fetch(`${cfg.base}/api/internal/admin/pledges/send`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${cfg.secret}` },
    body: JSON.stringify(body),
  })
  const json = await res.json().catch(() => ({}))
  if (!res.ok) return { ok: false, sent: 0, failed: 0, skipped: 0, dryRun: false, error: json.error ?? `Send failed (${res.status})` }
  return json as SendSummaryResult
}

/** Send the couple's self-pledge link to selected guests, on staff's behalf. */
export async function sendPledgeRequestsAdmin(
  userId: string,
  channel: 'whatsapp' | 'sms' | 'email',
  guestIds: string[],
  eventId?: string,
): Promise<SendSummaryResult> {
  await requirePermission('opuspass.pledges.write')
  try {
    await assertEligible(userId)
    if (!guestIds.length) return { ok: true, sent: 0, failed: 0, skipped: 0, dryRun: true }

    let result: SendSummaryResult
    if (channel === 'email') {
      result = await sendPledgeRequestEmails(userId, guestIds)
    } else {
      result = await callInternalPledgeSend({ action: 'pledge_request', channel, userId, eventId, guestIds })
    }

    await logPledgeAction({
      message: `Sent ${channel} pledge request to ${guestIds.length} contributor(s)`,
      targetResource: `couple_profiles:${userId}`,
      userId,
      eventId,
      metadata: { channel, guestIds, result },
    })
    revalidatePath(`/opus-pass/pledges/${userId}`)
    return result
  } catch (err) {
    return {
      ok: false,
      sent: 0,
      failed: 0,
      skipped: 0,
      dryRun: false,
      error: err instanceof Error ? err.message : 'Failed to send pledge requests',
    }
  }
}

async function sendPledgeRequestEmails(userId: string, guestIds: string[]): Promise<SendSummaryResult> {
  const supabase = createSupabaseAdminClient()
  const live = isEmailConfigured()
  const summary: SendSummaryResult = { ok: true, sent: 0, failed: 0, skipped: 0, dryRun: !live }

  const { data: profile } = await supabase
    .from('couple_profiles')
    .select('partner1_name, partner2_name, user_id')
    .eq('user_id', userId)
    .maybeSingle<{ partner1_name: string | null; partner2_name: string | null }>()
  const coupleName = [profile?.partner1_name, profile?.partner2_name].filter(Boolean).join(' & ') || 'The Couple'

  const { data: userRow } = await supabase.from('users').select('pledge_token').eq('id', userId).maybeSingle<{ pledge_token: string | null }>()
  const base = process.env.NEXT_PUBLIC_OPUS_PASS_URL?.replace(/\/$/, '')
  if (!userRow?.pledge_token || !base) return summary

  const { data: guests, error } = await supabase.from('guest_contacts').select('id, full_name, email').eq('user_id', userId).in('id', guestIds)
  if (error) throw new Error(error.message)

  const link = `${base}/pledge/${userRow.pledge_token}`
  for (const g of (guests ?? []) as { id: string; full_name: string; email: string | null }[]) {
    if (!g.email) {
      summary.skipped += 1
      continue
    }
    const subject = `You're invited to contribute — ${coupleName}`
    const html = `<p>${g.full_name ? `${g.full_name}, ` : ''}${coupleName} are preparing their event and would value your contribution.</p><p><a href="${link}">Pledge your contribution</a></p>`
    let ok = true
    if (live) {
      ok = (await sendEmail({ to: g.email, subject, html, text: `${subject}\n${link}` })).sent
    }
    if (ok) summary.sent += 1
    else summary.failed += 1
  }
  return summary
}

/** Send a follow-up reminder for one pledge, on staff's behalf. */
export async function sendPledgeReminderAdmin(
  userId: string,
  pledgeId: string,
  channel: 'whatsapp' | 'sms' | 'email',
  message: string,
): Promise<SendSummaryResult> {
  await requirePermission('opuspass.pledges.write')
  try {
    await assertEligible(userId)

    let result: SendSummaryResult
    if (channel === 'email') {
      result = await sendPledgeReminderEmail(userId, pledgeId, message)
    } else {
      result = await callInternalPledgeSend({ action: 'pledge_reminder', channel, userId, pledgeId, message })
    }

    await logPledgeAction({
      message: `Sent ${channel} pledge reminder`,
      targetResource: `event_pledges:${pledgeId}`,
      userId,
      metadata: { channel, result },
    })
    revalidatePath(`/opus-pass/pledges/${userId}`)
    return result
  } catch (err) {
    return {
      ok: false,
      sent: 0,
      failed: 0,
      skipped: 0,
      dryRun: false,
      error: err instanceof Error ? err.message : 'Failed to send pledge reminder',
    }
  }
}

async function sendPledgeReminderEmail(userId: string, pledgeId: string, message: string): Promise<SendSummaryResult> {
  const supabase = createSupabaseAdminClient()
  const live = isEmailConfigured()

  const { data: pledge } = await supabase.from('event_pledges').select('guest_contact_id').eq('id', pledgeId).eq('user_id', userId).maybeSingle<{ guest_contact_id: string }>()
  if (!pledge) return { ok: false, sent: 0, failed: 1, skipped: 0, dryRun: !live, error: 'Pledge not found' }

  const { data: contact } = await supabase.from('guest_contacts').select('email').eq('id', pledge.guest_contact_id).eq('user_id', userId).maybeSingle<{ email: string | null }>()
  if (!contact?.email) return { ok: false, sent: 0, failed: 0, skipped: 1, dryRun: !live, error: 'No email on file' }

  let ok = true
  if (live) {
    ok = (await sendEmail({ to: contact.email, subject: 'A gentle reminder', html: message.replace(/\n/g, '<br>'), text: message })).sent
  }
  if (!ok) return { ok: false, sent: 0, failed: 1, skipped: 0, dryRun: !live, error: 'Send failed' }

  const { data: pledgeRow } = await supabase.from('event_pledges').select('reminder_count, reminder_cadence').eq('id', pledgeId).eq('user_id', userId).maybeSingle<{ reminder_count: number; reminder_cadence: string }>()
  if (pledgeRow) {
    const now = new Date()
    const cadenceDays: Record<string, number | null> = { none: null, weekly: 7, biweekly: 14 }
    const days = cadenceDays[pledgeRow.reminder_cadence] ?? null
    const nextReminderAt = days ? new Date(now.getTime() + days * 86400000).toISOString() : null
    await supabase
      .from('event_pledges')
      .update({ last_reminded_at: now.toISOString(), reminder_count: pledgeRow.reminder_count + 1, next_reminder_at: nextReminderAt })
      .eq('id', pledgeId)
      .eq('user_id', userId)
    await supabase.from('pledge_reminder_log').insert({ user_id: userId, pledge_id: pledgeId, channel: 'email' })
  }
  return { ok: true, sent: 1, failed: 0, skipped: 0, dryRun: !live }
}
