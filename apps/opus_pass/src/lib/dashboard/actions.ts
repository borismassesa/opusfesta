'use server'

import { revalidatePath } from 'next/cache'
import { createDashboardClient } from './supabase'
import { requireDashboardUser } from './auth'
import type { PledgePageConfig, PledgePaymentMethod } from './pledge-page'
import { paymentMethodsToText } from './pledge-page'
import type {
  AttendanceAnswer,
  CardStatus,
  ChildEntry,
  EventType,
  PaymentMethod,
  PledgeStatus,
  ReminderCadence,
  RsvpStatus,
  SendChannel,
} from './types'

function revalidateDashboard() {
  revalidatePath('/my/dashboard')
  revalidatePath('/my/dashboard/guests')
  revalidatePath('/my/dashboard/events')
  revalidatePath('/my/dashboard/invitations')
  revalidatePath('/my/dashboard/rsvps')
  revalidatePath('/my/dashboard/pledges')
  revalidatePath('/my/dashboard/website')
}

// ---------------------------------------------------------------- Events

export interface EventInput {
  name: string
  event_type: EventType
  description?: string | null
  venue_name?: string | null
  address?: string | null
  city?: string | null
  starts_at?: string | null
  ends_at?: string | null
  dress_code?: string | null
  collect_meal_choice?: boolean
  meal_options?: string[]
  /** Show on public website. Defaults to true server-side. */
  is_public?: boolean
  /** Let guests RSVP via the website. Defaults to false server-side. */
  allow_rsvp?: boolean
  sort_order?: number
}

export async function createEvent(input: EventInput): Promise<void> {
  const user = await requireDashboardUser()
  const supabase = createDashboardClient()
  const { error } = await supabase.from('wedding_events').insert({
    user_id: user.id,
    name: input.name.trim(),
    event_type: input.event_type,
    description: input.description || null,
    venue_name: input.venue_name || null,
    address: input.address || null,
    city: input.city || null,
    starts_at: input.starts_at || null,
    ends_at: input.ends_at || null,
    dress_code: input.dress_code || null,
    collect_meal_choice: input.collect_meal_choice ?? false,
    meal_options: input.meal_options ?? [],
    is_public: input.is_public ?? true,
    allow_rsvp: input.allow_rsvp ?? false,
    sort_order: input.sort_order ?? 0,
  })
  if (error) throw new Error(error.message)
  revalidateDashboard()
}

export async function updateEvent(id: string, input: EventInput): Promise<void> {
  const user = await requireDashboardUser()
  const supabase = createDashboardClient()
  const { error } = await supabase
    .from('wedding_events')
    .update({
      name: input.name.trim(),
      event_type: input.event_type,
      description: input.description || null,
      venue_name: input.venue_name || null,
      address: input.address || null,
      city: input.city || null,
      starts_at: input.starts_at || null,
      ends_at: input.ends_at || null,
      dress_code: input.dress_code || null,
      collect_meal_choice: input.collect_meal_choice ?? false,
      meal_options: input.meal_options ?? [],
      is_public: input.is_public ?? true,
      allow_rsvp: input.allow_rsvp ?? false,
      sort_order: input.sort_order ?? 0,
    })
    .eq('id', id)
    .eq('user_id', user.id)
  if (error) throw new Error(error.message)
  revalidateDashboard()
}

export async function deleteEvent(id: string): Promise<void> {
  const user = await requireDashboardUser()
  const supabase = createDashboardClient()
  const { error } = await supabase.from('wedding_events').delete().eq('id', id).eq('user_id', user.id)
  if (error) throw new Error(error.message)
  revalidateDashboard()
}

// ---------------------------------------------------------------- Guests

export interface GuestInput {
  /** Required for the legacy code path / public RSVP page; auto-synthesized from
   *  title + first + last + suffix when first_name/last_name are present. */
  full_name?: string
  title?: string | null
  first_name?: string | null
  last_name?: string | null
  suffix?: string | null

  plus_one_title?: string | null
  plus_one_first_name?: string | null
  plus_one_last_name?: string | null
  plus_one_suffix?: string | null
  plus_one_name_unknown?: boolean

  children?: ChildEntry[]

  email?: string | null
  phone?: string | null
  whatsapp_phone?: string | null
  group_tag?: string | null
  max_party_size?: number
  notes?: string | null

  name_on_envelope?: string | null
  address_country?: string | null
  address_line1?: string | null
  address_apt?: string | null
  address_city?: string | null
  address_region?: string | null
  address_postal_code?: string | null

  /** Event ids this guest should be invited to (syncs invitations). */
  eventIds?: string[]
}

function composeName(parts: Array<string | null | undefined>): string {
  return parts
    .map((p) => (p ?? '').trim())
    .filter(Boolean)
    .join(' ')
}

function guestColumnsFromInput(input: GuestInput): Record<string, unknown> {
  const first = (input.first_name ?? '').trim() || null
  const last = (input.last_name ?? '').trim() || null
  const title = (input.title ?? '').trim() || null
  const suffix = (input.suffix ?? '').trim() || null
  const composed = composeName([title, first, last, suffix])
  const full_name = (input.full_name ?? composed).trim()
  if (!full_name) throw new Error('Guest name is required')

  const plusOneNameUnknown = input.plus_one_name_unknown === true
  const plusOneFirst = (input.plus_one_first_name ?? '').trim() || null
  const plusOneLast = (input.plus_one_last_name ?? '').trim() || null
  const children = (input.children ?? [])
    .map((c) => ({
      first_name: (c.first_name ?? '').trim(),
      last_name: (c.last_name ?? '').trim(),
    }))
    .filter((c) => c.first_name || c.last_name)

  // Derive a sensible max_party_size if the caller didn't pin one.
  const hasPlusOne = plusOneNameUnknown || Boolean(plusOneFirst) || Boolean(plusOneLast)
  const derivedParty = 1 + (hasPlusOne ? 1 : 0) + children.length
  const max_party_size = input.max_party_size ?? Math.max(1, derivedParty)

  return {
    full_name,
    title,
    first_name: first,
    last_name: last,
    suffix,

    plus_one_title: (input.plus_one_title ?? '').trim() || null,
    plus_one_first_name: plusOneFirst,
    plus_one_last_name: plusOneLast,
    plus_one_suffix: (input.plus_one_suffix ?? '').trim() || null,
    plus_one_name_unknown: plusOneNameUnknown,

    children,

    email: (input.email ?? '').trim() || null,
    phone: (input.phone ?? '').trim() || null,
    whatsapp_phone: (input.whatsapp_phone ?? '').trim() || null,
    group_tag: (input.group_tag ?? '').trim() || null,
    max_party_size,
    notes: (input.notes ?? '').trim() || null,

    name_on_envelope: (input.name_on_envelope ?? '').trim() || null,
    address_country: (input.address_country ?? '').trim() || null,
    address_line1: (input.address_line1 ?? '').trim() || null,
    address_apt: (input.address_apt ?? '').trim() || null,
    address_city: (input.address_city ?? '').trim() || null,
    address_region: (input.address_region ?? '').trim() || null,
    address_postal_code: (input.address_postal_code ?? '').trim() || null,
  }
}

/** Returns only the event ids that belong to this user — prevents attaching a
 *  guest to another couple's event (the FK only checks existence, not ownership). */
async function ownedEventIds(userId: string, eventIds: string[]): Promise<string[]> {
  if (eventIds.length === 0) return []
  const supabase = createDashboardClient()
  const { data } = await supabase
    .from('wedding_events')
    .select('id')
    .eq('user_id', userId)
    .in('id', eventIds)
  return (data ?? []).map((r) => r.id as string)
}

async function syncInvitations(userId: string, guestId: string, requestedEventIds: string[]) {
  const supabase = createDashboardClient()
  const eventIds = await ownedEventIds(userId, requestedEventIds)
  const { data: existing } = await supabase
    .from('guest_invitations')
    .select('id, event_id')
    .eq('user_id', userId)
    .eq('guest_contact_id', guestId)

  const have = new Map((existing ?? []).map((r) => [r.event_id as string, r.id as string]))
  const want = new Set(eventIds)

  const toAdd = eventIds.filter((eid) => !have.has(eid))
  const toRemove = [...have.entries()].filter(([eid]) => !want.has(eid)).map(([, id]) => id)

  if (toAdd.length) {
    const { error } = await supabase.from('guest_invitations').insert(
      toAdd.map((event_id) => ({ user_id: userId, guest_contact_id: guestId, event_id }))
    )
    if (error) throw new Error(error.message)
  }
  if (toRemove.length) {
    const { error } = await supabase.from('guest_invitations').delete().in('id', toRemove)
    if (error) throw new Error(error.message)
  }
}

export async function createGuest(input: GuestInput): Promise<string> {
  const user = await requireDashboardUser()
  const supabase = createDashboardClient()
  const { data, error } = await supabase
    .from('guest_contacts')
    .insert({ user_id: user.id, ...guestColumnsFromInput(input) })
    .select('id')
    .single<{ id: string }>()
  if (error || !data) throw new Error(error?.message ?? 'Failed to create guest')

  if (input.eventIds?.length) {
    await syncInvitations(user.id, data.id, input.eventIds)
  }
  revalidateDashboard()
  return data.id
}

export async function updateGuest(id: string, input: GuestInput): Promise<void> {
  const user = await requireDashboardUser()
  const supabase = createDashboardClient()
  const { error } = await supabase
    .from('guest_contacts')
    .update(guestColumnsFromInput(input))
    .eq('id', id)
    .eq('user_id', user.id)
  if (error) throw new Error(error.message)

  if (input.eventIds) {
    await syncInvitations(user.id, id, input.eventIds)
  }
  revalidateDashboard()
}

export async function deleteGuest(id: string): Promise<void> {
  const user = await requireDashboardUser()
  const supabase = createDashboardClient()
  const { error } = await supabase.from('guest_contacts').delete().eq('id', id).eq('user_id', user.id)
  if (error) throw new Error(error.message)
  revalidateDashboard()
}

/** Paste names (one per line, optional "Name, email, phone") to bulk-add. */
export async function bulkImportGuests(text: string, eventIds: string[] = []): Promise<number> {
  const user = await requireDashboardUser()
  const supabase = createDashboardClient()

  const rows = text
    .split('\n')
    .map((line) => line.trim())
    .filter(Boolean)
    .map((line) => {
      const [full_name, email, phone] = line.split(',').map((p) => p.trim())
      return { full_name, email: email || null, phone: phone || null }
    })
    .filter((r) => r.full_name)

  if (rows.length === 0) return 0

  const { data, error } = await supabase
    .from('guest_contacts')
    .insert(rows.map((r) => ({ user_id: user.id, ...r })))
    .select('id')
  if (error) throw new Error(error.message)

  const ownedIds = await ownedEventIds(user.id, eventIds)
  if (ownedIds.length && data?.length) {
    const invites = data.flatMap((g) =>
      ownedIds.map((event_id) => ({ user_id: user.id, guest_contact_id: g.id, event_id }))
    )
    const { error: invErr } = await supabase.from('guest_invitations').insert(invites)
    if (invErr) throw new Error(invErr.message)
  }
  revalidateDashboard()
  return rows.length
}

// ---------------------------------------------------------------- RSVPs (owner edit)

export interface RsvpUpdate {
  rsvp_status?: RsvpStatus
  party_size?: number
  meal_choice?: string | null
  dietary_notes?: string | null
  guest_message?: string | null
}

export async function updateRsvp(invitationId: string, update: RsvpUpdate): Promise<void> {
  const user = await requireDashboardUser()
  const supabase = createDashboardClient()
  const patch: Record<string, unknown> = { ...update }
  if (update.rsvp_status) patch.responded_at = new Date().toISOString()
  const { error } = await supabase
    .from('guest_invitations')
    .update(patch)
    .eq('id', invitationId)
    .eq('user_id', user.id)
  if (error) throw new Error(error.message)
  revalidateDashboard()
}

// ---------------------------------------------------------------- Sending

export async function recordSend(guestId: string, channel: SendChannel): Promise<void> {
  const user = await requireDashboardUser()
  const supabase = createDashboardClient()

  const { data: guest } = await supabase
    .from('guest_contacts')
    .select('invite_count')
    .eq('id', guestId)
    .eq('user_id', user.id)
    .maybeSingle<{ invite_count: number }>()
  if (!guest) throw new Error('Guest not found')

  const { error } = await supabase
    .from('guest_contacts')
    .update({ last_invited_at: new Date().toISOString(), invite_count: guest.invite_count + 1 })
    .eq('id', guestId)
    .eq('user_id', user.id)
  if (error) throw new Error(error.message)

  const { error: logErr } = await supabase
    .from('guest_message_log')
    .insert({ user_id: user.id, guest_contact_id: guestId, channel })
  if (logErr) throw new Error(logErr.message)
  revalidateDashboard()
}

// ---------------------------------------------------------------- Pledges ("michango")

export interface PledgeInput {
  /** Link to an existing contributor. When omitted, a new guest_contacts row is created. */
  guestContactId?: string
  /** New contributor details (used only when guestContactId is omitted). */
  full_name?: string
  phone?: string | null
  whatsapp_phone?: string | null
  email?: string | null
  group_tag?: string | null

  pledged_amount?: number
  amount_received?: number
  currency?: string
  promised_date?: string | null
  status?: PledgeStatus
  payment_method?: PaymentMethod | null
  will_attend?: AttendanceAnswer | null
  card_status?: CardStatus
  reminder_cadence?: ReminderCadence
  notes?: string | null
}

const CADENCE_DAYS: Record<ReminderCadence, number | null> = {
  none: null,
  weekly: 7,
  biweekly: 14,
}

/** Next reminder timestamp from a cadence, measured from `from` (default now). */
function nextReminderAt(cadence: ReminderCadence, from = new Date()): string | null {
  const days = CADENCE_DAYS[cadence]
  if (!days) return null
  const next = new Date(from)
  next.setDate(next.getDate() + days)
  return next.toISOString()
}

/** Derive a status from the money when the caller didn't pin one explicitly. */
function derivePledgeStatus(
  explicit: PledgeStatus | undefined,
  pledged: number,
  received: number,
): PledgeStatus {
  if (explicit) return explicit
  if (received <= 0) return pledged > 0 ? 'pledged' : 'invited'
  if (received >= pledged && pledged > 0) return 'paid'
  return 'partial'
}

function pledgeColumnsFromInput(input: PledgeInput): Record<string, unknown> {
  const pledged = Math.max(0, Number(input.pledged_amount ?? 0))
  const received = Math.max(0, Number(input.amount_received ?? 0))
  const cadence: ReminderCadence = input.reminder_cadence ?? 'none'
  return {
    pledged_amount: pledged,
    amount_received: received,
    currency: (input.currency ?? 'TZS').trim() || 'TZS',
    promised_date: input.promised_date || null,
    status: derivePledgeStatus(input.status, pledged, received),
    payment_method: input.payment_method || null,
    will_attend: input.will_attend || null,
    card_status: input.card_status ?? 'none',
    reminder_cadence: cadence,
    next_reminder_at: nextReminderAt(cadence),
    notes: (input.notes ?? '').trim() || null,
  }
}

/** Resolve the contributor's contact row, creating one when a new name is given. */
async function resolvePledgeContact(userId: string, input: PledgeInput): Promise<string> {
  const supabase = createDashboardClient()
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

export async function createPledge(input: PledgeInput): Promise<string> {
  const user = await requireDashboardUser()
  const supabase = createDashboardClient()
  const guestContactId = await resolvePledgeContact(user.id, input)

  const { data, error } = await supabase
    .from('event_pledges')
    .insert({
      user_id: user.id,
      guest_contact_id: guestContactId,
      ...pledgeColumnsFromInput(input),
    })
    .select('id')
    .single<{ id: string }>()
  if (error || !data) throw new Error(error?.message ?? 'Failed to create pledge')
  revalidateDashboard()
  return data.id
}

export async function updatePledge(id: string, input: PledgeInput): Promise<void> {
  const user = await requireDashboardUser()
  const supabase = createDashboardClient()
  // Allow moving a pledge onto a different existing contributor, but never null it.
  const patch = pledgeColumnsFromInput(input)
  if (input.guestContactId) {
    const contactId = await resolvePledgeContact(user.id, { guestContactId: input.guestContactId })
    ;(patch as Record<string, unknown>).guest_contact_id = contactId
  }
  const { error } = await supabase
    .from('event_pledges')
    .update(patch)
    .eq('id', id)
    .eq('user_id', user.id)
  if (error) throw new Error(error.message)
  revalidateDashboard()
}

/** One-click "they paid": set received to the full pledged amount and mark paid. */
export async function markPledgePaid(id: string): Promise<void> {
  const user = await requireDashboardUser()
  const supabase = createDashboardClient()

  const { data: pledge } = await supabase
    .from('event_pledges')
    .select('pledged_amount')
    .eq('id', id)
    .eq('user_id', user.id)
    .maybeSingle<{ pledged_amount: number }>()
  if (!pledge) throw new Error('Pledge not found')

  const { error } = await supabase
    .from('event_pledges')
    .update({
      amount_received: pledge.pledged_amount,
      status: 'paid',
      next_reminder_at: null,
    })
    .eq('id', id)
    .eq('user_id', user.id)
  if (error) throw new Error(error.message)
  revalidateDashboard()
}

export async function deletePledge(id: string): Promise<void> {
  const user = await requireDashboardUser()
  const supabase = createDashboardClient()
  const { error } = await supabase.from('event_pledges').delete().eq('id', id).eq('user_id', user.id)
  if (error) throw new Error(error.message)
  revalidateDashboard()
}

/** Log a follow-up and advance the reminder schedule (mirrors recordSend). */
export async function recordPledgeReminder(pledgeId: string, channel: SendChannel): Promise<void> {
  const user = await requireDashboardUser()
  const supabase = createDashboardClient()

  const { data: pledge } = await supabase
    .from('event_pledges')
    .select('reminder_count, reminder_cadence')
    .eq('id', pledgeId)
    .eq('user_id', user.id)
    .maybeSingle<{ reminder_count: number; reminder_cadence: ReminderCadence }>()
  if (!pledge) throw new Error('Pledge not found')

  const now = new Date()
  const { error } = await supabase
    .from('event_pledges')
    .update({
      last_reminded_at: now.toISOString(),
      reminder_count: pledge.reminder_count + 1,
      next_reminder_at: nextReminderAt(pledge.reminder_cadence, now),
    })
    .eq('id', pledgeId)
    .eq('user_id', user.id)
  if (error) throw new Error(error.message)

  const { error: logErr } = await supabase
    .from('pledge_reminder_log')
    .insert({ user_id: user.id, pledge_id: pledgeId, channel })
  if (logErr) throw new Error(logErr.message)
  revalidateDashboard()
}

// ---------------------------------------------------------------- Couple profile

export interface CoupleProfileInput {
  partner1_name: string
  partner2_name?: string | null
  wedding_date?: string | null
  whatsapp_phone?: string | null
  city?: string | null
  pledge_payment_instructions?: string | null
  pledge_goal_amount?: number | null
}

export async function upsertCoupleProfile(input: CoupleProfileInput): Promise<void> {
  const user = await requireDashboardUser()
  const supabase = createDashboardClient()
  const { error } = await supabase.from('couple_profiles').upsert(
    {
      user_id: user.id,
      partner1_name: input.partner1_name.trim(),
      partner2_name: input.partner2_name || null,
      wedding_date: input.wedding_date || null,
      whatsapp_phone: input.whatsapp_phone || null,
      city: input.city || null,
      pledge_payment_instructions: input.pledge_payment_instructions || null,
      pledge_goal_amount:
        input.pledge_goal_amount && input.pledge_goal_amount > 0 ? input.pledge_goal_amount : null,
      updated_at: new Date().toISOString(),
    },
    { onConflict: 'user_id' }
  )
  if (error) throw new Error(error.message)
  revalidatePath('/my/dashboard/settings')
  revalidateDashboard()
}

/** Update just the pledge-collection settings (goal + how-to-pay) without
 *  touching the couple's names. Creates a minimal profile row if none exists. */
export async function updatePledgeCollection(input: {
  goalAmount: number | null
  paymentMethods: PledgePaymentMethod[]
}): Promise<void> {
  const user = await requireDashboardUser()
  const supabase = createDashboardClient()
  // Keep only filled-in rows; derive the legacy text so reminders keep working.
  const methods = (input.paymentMethods ?? []).filter((m) => m.label?.trim() || m.value?.trim())
  const patch = {
    pledge_goal_amount: input.goalAmount && input.goalAmount > 0 ? input.goalAmount : null,
    pledge_payment_methods: methods,
    pledge_payment_instructions: paymentMethodsToText(methods) || null,
    updated_at: new Date().toISOString(),
  }
  const { data, error } = await supabase
    .from('couple_profiles')
    .update(patch)
    .eq('user_id', user.id)
    .select('id')
  if (error) throw new Error(error.message)
  if (!data || data.length === 0) {
    const { error: insErr } = await supabase
      .from('couple_profiles')
      .insert({ user_id: user.id, partner1_name: 'The Couple', ...patch })
    if (insErr) throw new Error(insErr.message)
  }
  revalidatePath('/my/dashboard/pledges')
  revalidatePath('/my/dashboard/settings')
}

/** Save the couple's public pledge-page customizations (wording, colors, cover). */
export async function updatePledgePageConfig(config: PledgePageConfig): Promise<void> {
  const user = await requireDashboardUser()
  const supabase = createDashboardClient()
  // Update the existing profile; if there isn't one yet, create a minimal row
  // (partner1_name is required) so the customization isn't silently dropped.
  const { data, error } = await supabase
    .from('couple_profiles')
    .update({ pledge_page: config, updated_at: new Date().toISOString() })
    .eq('user_id', user.id)
    .select('id')
  if (error) throw new Error(error.message)
  if (!data || data.length === 0) {
    const { error: insErr } = await supabase
      .from('couple_profiles')
      .insert({ user_id: user.id, partner1_name: 'The Couple', pledge_page: config })
    if (insErr) throw new Error(insErr.message)
  }
  revalidatePath('/my/dashboard/pledges')
}

/** Upload a cover image for the pledge page; returns its public URL. */
export async function uploadPledgeCover(formData: FormData): Promise<string> {
  const user = await requireDashboardUser()
  const file = formData.get('file')
  if (!(file instanceof File) || file.size === 0) throw new Error('No image selected')
  if (!file.type.startsWith('image/')) throw new Error('Please choose an image file')
  if (file.size > 5 * 1024 * 1024) throw new Error('Image must be 5MB or smaller')

  const supabase = createDashboardClient()
  const ext = (file.name.split('.').pop() || 'jpg').toLowerCase().replace(/[^a-z0-9]/g, '')
  const path = `${user.id}/cover-${Date.now()}.${ext}`
  const { error } = await supabase.storage
    .from('pledge-covers')
    .upload(path, file, { contentType: file.type, upsert: true })
  if (error) throw new Error(error.message)

  const { data } = supabase.storage.from('pledge-covers').getPublicUrl(path)
  return data.publicUrl
}

/** Save the couple's public Contact Collector page customizations. */
export async function updateCollectorPageConfig(config: PledgePageConfig): Promise<void> {
  const user = await requireDashboardUser()
  const supabase = createDashboardClient()
  const { data, error } = await supabase
    .from('couple_profiles')
    .update({ collector_page: config, updated_at: new Date().toISOString() })
    .eq('user_id', user.id)
    .select('id')
  if (error) throw new Error(error.message)
  if (!data || data.length === 0) {
    const { error: insErr } = await supabase
      .from('couple_profiles')
      .insert({ user_id: user.id, partner1_name: 'The Couple', collector_page: config })
    if (insErr) throw new Error(insErr.message)
  }
  revalidatePath('/my/dashboard/guests')
}

// ---------------------------------------------------------------- Public RSVP submit (token, no auth)

export interface PublicRsvpResponse {
  invitationId: string
  rsvp_status: RsvpStatus
  party_size: number
  meal_choice?: string | null
  dietary_notes?: string | null
  guest_message?: string | null
}

export async function submitPublicRsvp(
  token: string,
  responses: PublicRsvpResponse[]
): Promise<{ ok: boolean; error?: string }> {
  const supabase = createDashboardClient()

  // Resolve the guest by token; this is the bearer secret gating access.
  const { data: guest, error: guestErr } = await supabase
    .from('guest_contacts')
    .select('id, max_party_size')
    .eq('public_token', token)
    .maybeSingle<{ id: string; max_party_size: number }>()
  if (guestErr) {
    console.error('[public-rsvp] guest lookup failed', guestErr)
    return { ok: false, error: 'Something went wrong — please try again in a moment.' }
  }
  if (!guest) return { ok: false, error: 'Invitation not found.' }

  // Only allow updates to invitations that belong to this guest.
  const { data: owned, error: ownedErr } = await supabase
    .from('guest_invitations')
    .select('id')
    .eq('guest_contact_id', guest.id)
  if (ownedErr) {
    console.error('[public-rsvp] invitation lookup failed', ownedErr)
    return { ok: false, error: 'Something went wrong — please try again in a moment.' }
  }
  const ownedIds = new Set((owned ?? []).map((r) => r.id as string))

  const now = new Date().toISOString()
  for (const r of responses) {
    if (!ownedIds.has(r.invitationId)) continue
    const partySize = Math.max(1, Math.min(r.party_size || 1, guest.max_party_size))
    const { error } = await supabase
      .from('guest_invitations')
      .update({
        rsvp_status: r.rsvp_status,
        party_size: r.rsvp_status === 'attending' ? partySize : 1,
        meal_choice: r.meal_choice || null,
        dietary_notes: r.dietary_notes || null,
        guest_message: r.guest_message || null,
        responded_at: now,
      })
      .eq('id', r.invitationId)
      .eq('guest_contact_id', guest.id)
    if (error) return { ok: false, error: error.message }
  }

  revalidatePath(`/rsvp/${token}`)
  return { ok: true }
}
