'use server'

import { revalidatePath } from 'next/cache'
import { createSupabaseAdminClient } from '@/lib/supabase'
import { getCallerEmail, requirePermission } from '@/lib/admin-auth'
import { insertEntitlementAdjustment } from '@/lib/entitlements'

export type ActionResult = { ok: true } | { ok: false; error: string }

function clean(value: FormDataEntryValue | null): string {
  return typeof value === 'string' ? value.trim() : ''
}

function revalidateCouple(userId: string): void {
  revalidatePath('/opus-pass/couples')
  revalidatePath(`/opus-pass/couples/${userId}`)
}

/**
 * Attach an order that was bought without being signed in to the account whose
 * email it was placed under. Re-checks both halves of that claim against the
 * database rather than trusting the form: the order must still be unattached,
 * and its contact_email must still match this account's email. Without the
 * re-check, a stale page could hand over someone else's order.
 *
 * Also writes an audit_log row — this moves money onto an account, so it needs
 * to be traceable to the staff member who did it.
 */
export async function linkOrderToAccount(userId: string, orderId: string): Promise<ActionResult> {
  await requirePermission('opuspass.couples.write')
  if (!userId || !orderId) return { ok: false, error: 'Missing account or order.' }

  const supabase = createSupabaseAdminClient()

  const [{ data: user, error: userErr }, { data: order, error: orderErr }] = await Promise.all([
    supabase.from('users').select('email').eq('id', userId).maybeSingle<{ email: string | null }>(),
    supabase
      .from('invitation_orders')
      .select('id, ref, user_id, contact_email, amount_total, currency')
      .eq('id', orderId)
      .maybeSingle<{
        id: string
        ref: string
        user_id: string | null
        contact_email: string | null
        amount_total: number | string | null
        currency: string | null
      }>(),
  ])
  if (userErr) return { ok: false, error: userErr.message }
  if (orderErr) return { ok: false, error: orderErr.message }
  if (!user?.email) return { ok: false, error: 'This account has no email to match against.' }
  if (!order) return { ok: false, error: 'That order no longer exists.' }
  if (order.user_id) return { ok: false, error: 'That order is already attached to an account.' }
  if ((order.contact_email ?? '').toLowerCase() !== user.email.toLowerCase()) {
    return { ok: false, error: 'The order email no longer matches this account. Refresh and check again.' }
  }

  // Guard against a concurrent link: only claim the row if it is still NULL.
  const { data: updated, error: updateErr } = await supabase
    .from('invitation_orders')
    .update({ user_id: userId })
    .eq('id', orderId)
    .is('user_id', null)
    .select('id')
  if (updateErr) return { ok: false, error: updateErr.message }
  if (!updated?.length) return { ok: false, error: 'That order was attached by someone else just now.' }

  const adminEmail = (await getCallerEmail()) ?? 'admin'
  const { error: auditErr } = await supabase.from('audit_log').insert({
    event_type: 'opuspass.order_linked',
    severity: 'info',
    actor_email: adminEmail,
    target_resource: `invitation_orders:${order.id}`,
    message: `Linked order ${order.ref} (${order.currency ?? 'TZS'} ${Number(order.amount_total) || 0}) to account ${user.email}`,
    metadata: { order_id: order.id, order_ref: order.ref, user_id: userId, contact_email: order.contact_email },
  })
  // The link itself succeeded; a failed audit write should be loud in the
  // server log but must not report the whole action as failed.
  if (auditErr) console.error('[couples] audit_log insert failed after linking order', auditErr)

  revalidateCouple(userId)
  revalidatePath('/finance/payments')
  return { ok: true }
}

/** Grant or revoke send credits for one of the couple's events. Validation and
 *  the insert live in @/lib/entitlements, shared with finance's console. */
export async function adjustCoupleCredits(userId: string, formData: FormData): Promise<ActionResult> {
  await requirePermission('opuspass.couples.write')

  try {
    await insertEntitlementAdjustment({
      userId,
      eventId: clean(formData.get('eventId')),
      kind: clean(formData.get('kind')),
      direction: clean(formData.get('direction')),
      quantity: Number(clean(formData.get('quantity'))),
      reason: clean(formData.get('reason')),
      adminEmail: (await getCallerEmail()) ?? 'admin',
    })
  } catch (error) {
    return { ok: false, error: error instanceof Error ? error.message : 'Could not adjust credits.' }
  }

  revalidateCouple(userId)
  revalidatePath('/finance/payments')
  return { ok: true }
}

/** Internal staff note. Never shown to the couple — see the RLS comment on
 *  couple_account_notes (migration 20260722000001). */
export async function addCoupleNote(userId: string, body: string): Promise<ActionResult> {
  await requirePermission('opuspass.couples.write')

  const trimmed = body.trim()
  if (!userId) return { ok: false, error: 'Missing account.' }
  if (!trimmed) return { ok: false, error: 'Write something before saving the note.' }

  const supabase = createSupabaseAdminClient()
  const { error } = await supabase.from('couple_account_notes').insert({
    user_id: userId,
    body: trimmed,
    admin_email: (await getCallerEmail()) ?? 'admin',
  })
  if (error) return { ok: false, error: error.message }

  revalidateCouple(userId)
  return { ok: true }
}
