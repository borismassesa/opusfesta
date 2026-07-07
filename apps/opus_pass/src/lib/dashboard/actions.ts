'use server'

import { revalidatePath } from 'next/cache'
import { createDashboardClient } from './supabase'
import { requireDashboardUser } from './auth'
import { createNotification } from './notifications'
import type { PledgePageConfig, PledgePaymentMethod } from './pledge-page'
import { paymentMethodsToText } from './pledge-page'
import { coupleSlugBase, firstNameOf, formatLongDate, normalizePhone, publicOrigin } from './share'
import { getMyCollectorToken, getMyPledgeToken, getWhatsAppEntitlement, getEvents, fetchPaidOrdersForCouple, ownedEventIds } from './queries'
import { getWhatsAppProvider } from '@/lib/whatsapp'
import type { LinkRequestKind } from '@/lib/whatsapp/types'
import type {
  AttendanceAnswer,
  CardStatus,
  ChildEntry,
  EventType,
  PaymentMethod,
  PledgeStatus,
  ReminderCadence,
  RsvpQuestionKind,
  RsvpQuestionOption,
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
  revalidatePath('/my/dashboard/seating')
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

/** Toggle "Collect RSVPs" for one event (the management-dashboard switch). */
export async function setEventAllowRsvp(eventId: string, allow: boolean): Promise<void> {
  const user = await requireDashboardUser()
  const supabase = createDashboardClient()
  const { error } = await supabase
    .from('wedding_events')
    .update({ allow_rsvp: allow, updated_at: new Date().toISOString() })
    .eq('id', eventId)
    .eq('user_id', user.id)
  if (error) throw new Error(error.message)
  revalidateDashboard()
}

// ---------------------------------------------------------------- RSVP questions

export interface RsvpQuestionInput {
  /** NULL = a general question asked to everyone; set = a per-event follow-up. */
  event_id?: string | null
  prompt: string
  description?: string | null
  kind: RsvpQuestionKind
  required?: boolean
  attending_only?: boolean
  /** For multiple_choice. Ids are generated server-side when missing. */
  options?: { id?: string; label: string; description?: string | null }[]
  sort_order?: number
}

/** Build a clean, validated options array for a multiple-choice question. */
function normalizeOptions(input: RsvpQuestionInput): RsvpQuestionOption[] {
  if (input.kind !== 'multiple_choice') return []
  return (input.options ?? [])
    .map((o) => ({
      id: o.id?.trim() || `opt_${crypto.randomUUID().slice(0, 8)}`,
      label: o.label.trim(),
      description: o.description?.trim() || null,
    }))
    .filter((o) => o.label.length > 0)
}

export async function createRsvpQuestion(input: RsvpQuestionInput): Promise<void> {
  const user = await requireDashboardUser()
  const supabase = createDashboardClient()
  const prompt = input.prompt.trim()
  if (!prompt) throw new Error('Please enter a question.')
  const options = normalizeOptions(input)
  if (input.kind === 'multiple_choice' && options.length < 2) {
    throw new Error('Multiple-choice questions need at least two options.')
  }
  const { error } = await supabase.from('rsvp_questions').insert({
    user_id: user.id,
    event_id: input.event_id ?? null,
    prompt,
    description: input.description?.trim() || null,
    kind: input.kind,
    // Multiple-choice answers are required by default; short answers are skippable.
    required: input.required ?? input.kind === 'multiple_choice',
    attending_only: input.attending_only ?? false,
    options,
    sort_order: input.sort_order ?? 0,
  })
  if (error) throw new Error(error.message)
  revalidatePath('/my/dashboard/rsvps')
}

export async function updateRsvpQuestion(id: string, input: RsvpQuestionInput): Promise<void> {
  const user = await requireDashboardUser()
  const supabase = createDashboardClient()
  const prompt = input.prompt.trim()
  if (!prompt) throw new Error('Please enter a question.')
  const options = normalizeOptions(input)
  if (input.kind === 'multiple_choice' && options.length < 2) {
    throw new Error('Multiple-choice questions need at least two options.')
  }
  const { error } = await supabase
    .from('rsvp_questions')
    .update({
      event_id: input.event_id ?? null,
      prompt,
      description: input.description?.trim() || null,
      kind: input.kind,
      required: input.required ?? input.kind === 'multiple_choice',
      attending_only: input.attending_only ?? false,
      options,
      updated_at: new Date().toISOString(),
    })
    .eq('id', id)
    .eq('user_id', user.id)
  if (error) throw new Error(error.message)
  revalidatePath('/my/dashboard/rsvps')
}

export async function deleteRsvpQuestion(id: string): Promise<void> {
  const user = await requireDashboardUser()
  const supabase = createDashboardClient()
  const { error } = await supabase.from('rsvp_questions').delete().eq('id', id).eq('user_id', user.id)
  if (error) throw new Error(error.message)
  revalidatePath('/my/dashboard/rsvps')
}

/** Persist a new ordering for a set of questions (drag-to-reorder). */
export async function reorderRsvpQuestions(orderedIds: string[]): Promise<void> {
  const user = await requireDashboardUser()
  const supabase = createDashboardClient()
  await Promise.all(
    orderedIds.map((id, i) =>
      supabase
        .from('rsvp_questions')
        .update({ sort_order: i, updated_at: new Date().toISOString() })
        .eq('id', id)
        .eq('user_id', user.id),
    ),
  )
  revalidatePath('/my/dashboard/rsvps')
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

/** All of the couple's event ids — the default linkage for a new guest. */
async function allOwnedEventIds(userId: string): Promise<string[]> {
  const supabase = createDashboardClient()
  const { data } = await supabase.from('wedding_events').select('id').eq('user_id', userId)
  return (data ?? []).map((r) => r.id as string)
}

/** Guarantee a guest is linked to every one of the couple's events — the
 *  unified-roster invariant every surface (RSVPs, funnel, taps) relies on. */
async function ensureInvitationsForAllEvents(userId: string, guestId: string): Promise<void> {
  const supabase = createDashboardClient()
  const eventIds = await allOwnedEventIds(userId)
  if (!eventIds.length) return
  const { data: existing } = await supabase
    .from('guest_invitations')
    .select('event_id')
    .eq('user_id', userId)
    .eq('guest_contact_id', guestId)
  const have = new Set((existing ?? []).map((r) => r.event_id as string))
  const missing = eventIds.filter((id) => !have.has(id))
  if (missing.length) {
    await supabase
      .from('guest_invitations')
      .insert(missing.map((event_id) => ({ user_id: userId, guest_contact_id: guestId, event_id })))
  }
}

export async function createGuest(input: GuestInput): Promise<string> {
  const user = await requireDashboardUser()
  const supabase = createDashboardClient()

  // One person, one row: block a second contact with the same phone digits.
  const digits = (input.whatsapp_phone || input.phone || '').replace(/\D/g, '')
  if (digits) {
    const { data: contacts } = await supabase
      .from('guest_contacts')
      .select('full_name, phone, whatsapp_phone')
      .eq('user_id', user.id)
    const clash = (contacts ?? []).find(
      (c) =>
        (c.whatsapp_phone ?? '').replace(/\D/g, '') === digits ||
        (c.phone ?? '').replace(/\D/g, '') === digits,
    )
    if (clash) throw new Error(`This number is already on your list (${clash.full_name})`)
  }

  const { data, error } = await supabase
    .from('guest_contacts')
    .insert({ user_id: user.id, ...guestColumnsFromInput(input) })
    .select('id')
    .single<{ id: string }>()
  if (error || !data) throw new Error(error?.message ?? 'Failed to create guest')

  // Unified roster: a non-empty eventIds list (Guests form selection) narrows
  // deliberately; ANYTHING else — undefined (quick-add) or [] (form saved with
  // nothing ticked) — links the guest to every event. Zero-link guests are the
  // drift that made the dashboard surfaces disagree.
  if (input.eventIds?.length) {
    await syncInvitations(user.id, data.id, input.eventIds)
  } else {
    await ensureInvitationsForAllEvents(user.id, data.id)
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

/** Bulk remove guests from the roster in one statement (Send Invites table). */
export async function deleteGuests(guestIds: string[]): Promise<number> {
  const user = await requireDashboardUser()
  const supabase = createDashboardClient()
  if (!guestIds.length) return 0
  const { data, error } = await supabase
    .from('guest_contacts')
    .delete()
    .in('id', guestIds)
    .eq('user_id', user.id)
    .select('id')
  if (error) throw new Error(error.message)
  revalidateDashboard()
  return data?.length ?? 0
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

  // One person, one row — mirror createGuest's duplicate guard: skip lines
  // whose phone digits already exist on the roster or earlier in this batch.
  const { data: existing } = await supabase
    .from('guest_contacts')
    .select('phone, whatsapp_phone')
    .eq('user_id', user.id)
  const seen = new Set(
    (existing ?? [])
      .flatMap((c) => [c.phone, c.whatsapp_phone])
      .map((p) => (p ?? '').replace(/\D/g, ''))
      .filter(Boolean),
  )
  const fresh = rows.filter((r) => {
    const digits = (r.phone ?? '').replace(/\D/g, '')
    if (!digits) return true
    if (seen.has(digits)) return false
    seen.add(digits)
    return true
  })
  if (fresh.length === 0) return 0

  const { data, error } = await supabase
    .from('guest_contacts')
    .insert(fresh.map((r) => ({ user_id: user.id, ...r })))
    .select('id')
  if (error) throw new Error(error.message)

  // Unified roster: no explicit event selection means link to every event.
  const ownedIds = eventIds.length
    ? await ownedEventIds(user.id, eventIds)
    : await allOwnedEventIds(user.id)
  if (ownedIds.length && data?.length) {
    const invites = data.flatMap((g) =>
      ownedIds.map((event_id) => ({ user_id: user.id, guest_contact_id: g.id, event_id }))
    )
    const { error: invErr } = await supabase.from('guest_invitations').insert(invites)
    if (invErr) throw new Error(invErr.message)
  }
  revalidateDashboard()
  return fresh.length
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

/** A guest's answer to one custom RSVP question, tied to one invitation. */
export interface PublicRsvpAnswerInput {
  invitationId: string
  questionId: string
  answer_text?: string | null
  option_id?: string | null
}

/**
 * Upsert a batch of question answers for one guest. Only answers whose
 * invitation belongs to `guestId` and whose question belongs to `ownerUserId`
 * are written; empty answers are skipped (short answers are skippable).
 */
async function persistRsvpAnswers(
  supabase: ReturnType<typeof createDashboardClient>,
  ownerUserId: string,
  ownedInvitationIds: Set<string>,
  answers: PublicRsvpAnswerInput[],
): Promise<void> {
  if (!answers.length) return

  const questionIds = [...new Set(answers.map((a) => a.questionId))]
  const { data: questions } = await supabase
    .from('rsvp_questions')
    .select('id')
    .eq('user_id', ownerUserId)
    .in('id', questionIds)
  const ownedQuestionIds = new Set((questions ?? []).map((q) => q.id as string))

  const now = new Date().toISOString()
  const rows = answers
    .filter((a) => ownedInvitationIds.has(a.invitationId) && ownedQuestionIds.has(a.questionId))
    .map((a) => ({
      user_id: ownerUserId,
      guest_invitation_id: a.invitationId,
      question_id: a.questionId,
      answer_text: a.answer_text?.trim() || null,
      option_id: a.option_id || null,
      updated_at: now,
    }))
    .filter((r) => r.answer_text !== null || r.option_id !== null)

  if (!rows.length) return
  const { error } = await supabase
    .from('rsvp_answers')
    .upsert(rows, { onConflict: 'guest_invitation_id,question_id' })
  if (error) console.error('[rsvp-answers] upsert failed', error)
}

export async function submitPublicRsvp(
  token: string,
  responses: PublicRsvpResponse[],
  answers: PublicRsvpAnswerInput[] = [],
): Promise<{ ok: boolean; error?: string }> {
  const supabase = createDashboardClient()

  // Resolve the guest by token; this is the bearer secret gating access.
  const { data: guest, error: guestErr } = await supabase
    .from('guest_contacts')
    .select('id, max_party_size, user_id, full_name')
    .eq('public_token', token)
    .maybeSingle<{ id: string; max_party_size: number; user_id: string; full_name: string }>()
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
  let applied = 0
  // Representative response for the notification: prefer "attending" if the guest
  // is coming to any event, otherwise the last status they submitted.
  let summaryStatus: RsvpStatus | null = null
  let attendingParty = 0
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
    applied += 1
    if (r.rsvp_status === 'attending') {
      attendingParty = Math.max(attendingParty, partySize)
    }
    if (summaryStatus !== 'attending') summaryStatus = r.rsvp_status
  }

  // Persist answers to any custom RSVP questions.
  await persistRsvpAnswers(supabase, guest.user_id, ownedIds, answers)

  if (applied > 0 && summaryStatus) {
    const label =
      summaryStatus === 'attending'
        ? `Attending${attendingParty > 1 ? ` · party of ${attendingParty}` : ''}`
        : summaryStatus === 'declined'
          ? 'Declined'
          : summaryStatus === 'maybe'
            ? 'Maybe'
            : 'Responded'
    await createNotification({
      userId: guest.user_id,
      type: 'rsvp_received',
      title: `${guest.full_name} responded to your invitation`,
      body: label,
      href: '/my/dashboard/rsvps',
    })
  }

  revalidatePath(`/rsvp/${token}`)
  return { ok: true }
}

// ---------------------------------------------------------------- Public invitation hub

/**
 * Turn on the couple's public, forwardable invite link, generating a readable
 * slug from their names on first use (collision-suffixed). Idempotent: if a
 * slug already exists it's reused and sharing is simply (re)enabled. Returns
 * the slug so the dashboard can build the share URL.
 */
export async function enablePublicSharing(): Promise<{ slug: string }> {
  const user = await requireDashboardUser()
  const supabase = createDashboardClient()

  const { data: profile } = await supabase
    .from('couple_profiles')
    .select('partner1_name, partner2_name, public_slug')
    .eq('user_id', user.id)
    .maybeSingle<{ partner1_name: string | null; partner2_name: string | null; public_slug: string | null }>()

  let slug = profile?.public_slug ?? null
  if (!slug) {
    slug = await reserveUniqueSlug(
      supabase,
      coupleSlugBase(profile?.partner1_name ?? null, profile?.partner2_name ?? null),
    )
  }

  const patch = { public_slug: slug, public_sharing_enabled: true, updated_at: new Date().toISOString() }
  const { data: updated, error } = await supabase
    .from('couple_profiles')
    .update(patch)
    .eq('user_id', user.id)
    .select('id')
  if (error) throw new Error(error.message)
  if (!updated || updated.length === 0) {
    const { error: insErr } = await supabase
      .from('couple_profiles')
      .insert({ user_id: user.id, partner1_name: 'The Couple', ...patch })
    if (insErr) throw new Error(insErr.message)
  }

  revalidatePath('/my/dashboard')
  return { slug }
}

/** Find an unused public_slug, appending -2, -3… on collision. */
async function reserveUniqueSlug(
  supabase: ReturnType<typeof createDashboardClient>,
  base: string,
): Promise<string> {
  for (let n = 1; n < 50; n++) {
    const candidate = n === 1 ? base : `${base}-${n}`
    const { data } = await supabase
      .from('couple_profiles')
      .select('id')
      .eq('public_slug', candidate)
      .maybeSingle<{ id: string }>()
    if (!data) return candidate
  }
  // Extremely unlikely; fall back to a random suffix.
  return `${base}-${Math.floor(Date.now() % 100000)}`
}

/** Toggle the public link on/off (host-revocable kill switch). */
export async function setPublicSharing(enabled: boolean): Promise<void> {
  const user = await requireDashboardUser()
  const supabase = createDashboardClient()
  const { error } = await supabase
    .from('couple_profiles')
    .update({ public_sharing_enabled: enabled, updated_at: new Date().toISOString() })
    .eq('user_id', user.id)
  if (error) throw new Error(error.message)
  revalidatePath('/my/dashboard')
}

/** Upload the cover image used by the public hub + OG card; persists the URL. */
export async function uploadInviteCover(formData: FormData): Promise<string> {
  const user = await requireDashboardUser()
  const file = formData.get('file')
  if (!(file instanceof File) || file.size === 0) throw new Error('No image selected')
  if (!file.type.startsWith('image/')) throw new Error('Please choose an image file')
  if (file.size > 5 * 1024 * 1024) throw new Error('Image must be 5MB or smaller')

  const supabase = createDashboardClient()
  const ext = (file.name.split('.').pop() || 'jpg').toLowerCase().replace(/[^a-z0-9]/g, '')
  const path = `${user.id}/invite-cover-${Date.now()}.${ext}`
  // Reuse the existing public 'pledge-covers' bucket (couple-owned cover images).
  const { error } = await supabase.storage
    .from('pledge-covers')
    .upload(path, file, { contentType: file.type, upsert: true })
  if (error) throw new Error(error.message)

  const { data } = supabase.storage.from('pledge-covers').getPublicUrl(path)
  const url = data.publicUrl

  const { data: updated, error: upErr } = await supabase
    .from('couple_profiles')
    .update({ cover_image_url: url, updated_at: new Date().toISOString() })
    .eq('user_id', user.id)
    .select('id')
  if (upErr) throw new Error(upErr.message)
  if (!updated || updated.length === 0) {
    await supabase
      .from('couple_profiles')
      .insert({ user_id: user.id, partner1_name: 'The Couple', cover_image_url: url })
  }
  revalidatePath('/my/dashboard')
  return url
}

// ----------------------------------------------- Public self-RSVP (no auth, anti-hijack)

export interface PublicInviteRsvpInput {
  fullName: string
  phone: string
  email?: string | null
  status: RsvpStatus
  partySize: number
  message?: string | null
  /** Answers to the couple's general RSVP questions, keyed by question id. */
  answers?: { questionId: string; answer_text?: string | null; option_id?: string | null }[]
}

/**
 * RSVP submitted from the forwardable /i/<slug> link by a brand-new guest.
 *
 * Anti-hijack: this ALWAYS lands in the review bucket (source='public',
 * review_status='unconfirmed') and is keyed by phone, so it can never overwrite
 * or impersonate an existing named (host-added) guest. A repeat self-RSVP from
 * the same phone updates the prior self-registration rather than piling up
 * duplicates. The host approves/merges these from the dashboard.
 */
export async function submitPublicInviteRsvp(
  slug: string,
  input: PublicInviteRsvpInput,
): Promise<{ ok: boolean; error?: string }> {
  const fullName = input.fullName?.trim()
  const phone = normalizePhone(input.phone)
  if (!fullName) return { ok: false, error: 'Please enter your name.' }
  if (!phone) return { ok: false, error: 'Please enter a valid phone number.' }

  const supabase = createDashboardClient()

  // Resolve the couple by slug; sharing must be enabled.
  const { data: profile, error: pErr } = await supabase
    .from('couple_profiles')
    .select('user_id, public_sharing_enabled, wedding_date')
    .eq('public_slug', slug)
    .maybeSingle<{ user_id: string; public_sharing_enabled: boolean; wedding_date: string | null }>()
  if (pErr) {
    console.error('[public-invite-rsvp] profile lookup failed', pErr)
    return { ok: false, error: 'Something went wrong — please try again in a moment.' }
  }
  if (!profile || !profile.public_sharing_enabled) return { ok: false, error: 'This invitation link is no longer active.' }
  if (profile.wedding_date && profile.wedding_date < new Date().toISOString().slice(0, 10)) {
    return { ok: false, error: 'RSVPs for this celebration have closed.' }
  }

  // Events that accept RSVPs from the public link.
  const { data: events } = await supabase
    .from('wedding_events')
    .select('id')
    .eq('user_id', profile.user_id)
    .eq('is_public', true)
    .eq('allow_rsvp', true)
  const eventIds = (events ?? []).map((e) => e.id as string)
  if (eventIds.length === 0) return { ok: false, error: 'RSVPs are not open for this invitation.' }

  const partySize = Math.max(1, Math.min(Number(input.partySize) || 1, 20))

  // Reuse this phone's prior self-registration; never touch a host-added guest.
  const { data: existing } = await supabase
    .from('guest_contacts')
    .select('id')
    .eq('user_id', profile.user_id)
    .eq('source', 'public')
    .eq('phone', phone)
    .maybeSingle<{ id: string }>()

  let guestId = existing?.id ?? null
  if (guestId) {
    await supabase
      .from('guest_contacts')
      .update({
        full_name: fullName,
        email: input.email?.trim() || null,
        whatsapp_phone: phone,
        max_party_size: Math.max(partySize, 1),
        review_status: 'unconfirmed',
        updated_at: new Date().toISOString(),
      })
      .eq('id', guestId)
  } else {
    const { data: created, error: cErr } = await supabase
      .from('guest_contacts')
      .insert({
        user_id: profile.user_id,
        full_name: fullName,
        phone,
        whatsapp_phone: phone,
        email: input.email?.trim() || null,
        max_party_size: Math.max(partySize, 1),
        source: 'public',
        review_status: 'unconfirmed',
        group_tag: 'Self-registered',
      })
      .select('id')
      .single<{ id: string }>()
    if (cErr || !created) {
      console.error('[public-invite-rsvp] guest insert failed', cErr)
      return { ok: false, error: 'Something went wrong — please try again in a moment.' }
    }
    guestId = created.id
  }

  // Record their response against every RSVP-open event.
  const now = new Date().toISOString()
  const rows = eventIds.map((event_id) => ({
    user_id: profile.user_id,
    guest_contact_id: guestId as string,
    event_id,
    rsvp_status: input.status,
    party_size: input.status === 'attending' ? partySize : 1,
    guest_message: input.message?.trim() || null,
    responded_at: now,
  }))
  const { data: upserted, error: invErr } = await supabase
    .from('guest_invitations')
    .upsert(rows, { onConflict: 'guest_contact_id,event_id' })
    .select('id')
  if (invErr) {
    console.error('[public-invite-rsvp] invitation upsert failed', invErr)
    return { ok: false, error: 'Something went wrong — please try again in a moment.' }
  }

  // Persist answers to general questions against each of this guest's invitations
  // so they surface no matter which event the host opens in the tracker.
  if (input.answers?.length) {
    const invitationIds = (upserted ?? []).map((r) => r.id as string)
    const ownedIds = new Set(invitationIds)
    const flattened = invitationIds.flatMap((invitationId) =>
      (input.answers ?? []).map((a) => ({
        invitationId,
        questionId: a.questionId,
        answer_text: a.answer_text,
        option_id: a.option_id,
      })),
    )
    await persistRsvpAnswers(supabase, profile.user_id, ownedIds, flattened)
  }

  const statusLabel =
    input.status === 'attending'
      ? `Attending${partySize > 1 ? ` · party of ${partySize}` : ''}`
      : input.status === 'declined'
        ? 'Declined'
        : 'Maybe'
  await createNotification({
    userId: profile.user_id,
    type: 'rsvp_received',
    title: `${fullName} RSVP'd via your shared link`,
    body: `${statusLabel} · needs review`,
    href: '/my/dashboard/guests?review=1',
  })

  revalidatePath(`/i/${slug}`)
  revalidateDashboard()
  return { ok: true }
}

/** Approve a self-registered guest into the confirmed roster. */
export async function approveReviewGuest(guestId: string): Promise<void> {
  const user = await requireDashboardUser()
  const supabase = createDashboardClient()
  const { error } = await supabase
    .from('guest_contacts')
    .update({ review_status: 'confirmed', updated_at: new Date().toISOString() })
    .eq('id', guestId)
    .eq('user_id', user.id)
  if (error) throw new Error(error.message)
  // Approved guests join the unified roster like any other guest.
  await ensureInvitationsForAllEvents(user.id, guestId)
  revalidateDashboard()
}

/** Dismiss (delete) a self-registered guest the host doesn't recognise. */
export async function dismissReviewGuest(guestId: string): Promise<void> {
  const user = await requireDashboardUser()
  const supabase = createDashboardClient()
  const { error } = await supabase
    .from('guest_contacts')
    .delete()
    .eq('id', guestId)
    .eq('user_id', user.id)
    .eq('review_status', 'unconfirmed')
  if (error) throw new Error(error.message)
  revalidateDashboard()
}

// ---------------------------------------------------------------- WhatsApp invitations

/** Per-guest outcome of one send run — powers the results drawer. */
export interface WhatsAppSendResult {
  id: string
  name: string
  outcome: 'sent' | 'failed' | 'skipped' | 'blocked'
  /** Provider error message, for failed sends. */
  error?: string
  /** True when this was a credit-free re-send to an already-invited guest. */
  resend?: boolean
}

export interface WhatsAppSendSummary {
  sent: number
  failed: number
  /** Skipped because the guest has no phone number. */
  skipped: number
  /** Skipped because the couple has used up their paid invitation quota. */
  blocked: number
  /** True when handled by the dry-run stub (no live Meta account yet). */
  dryRun: boolean
  hasPaidOrder: boolean
  /** Total invitation credits the couple paid for. */
  purchased: number
  /** Credits left after this run. */
  remaining: number
  /** One entry per guest attempted, in send order. */
  results: WhatsAppSendResult[]
}

/**
 * Resolve which event a send is for when the caller doesn't pick one
 * explicitly (e.g. the Guests page's quick-send button, which has no event
 * switcher) — the couple's first event by their own sort order, matching the
 * "primary event" concept every event-scoped surface falls back to.
 */
async function resolveDefaultEventId(explicit?: string): Promise<string | null> {
  if (explicit) return explicit
  const events = await getEvents()
  return events[0]?.id ?? null
}

/**
 * Send the WhatsApp invitation to the given guests (or all confirmed guests
 * when no ids are passed). The header image is the card the COUPLE PAID FOR
 * (their purchased invitation design); the guest's first name goes in the
 * template body. Gated by entitlement: a paid order grants N credits
 * (= purchased guests) and each NEW guest consumes one — re-sends to a guest
 * already invited are free. Sends stop once the quota is exhausted.
 *
 * Uses the configured provider (Meta when credentials exist, else a dry-run
 * stub). Each send is logged to whatsapp_messages + guest_message_log.
 */
export async function sendWhatsAppInvites(guestIds?: string[], eventId?: string): Promise<WhatsAppSendSummary> {
  const user = await requireDashboardUser()
  const supabase = createDashboardClient()
  const provider = getWhatsAppProvider()
  const resolvedEventId = await resolveDefaultEventId(eventId)

  const summary: WhatsAppSendSummary = {
    sent: 0,
    failed: 0,
    skipped: 0,
    blocked: 0,
    dryRun: !provider.live,
    hasPaidOrder: false,
    purchased: 0,
    remaining: 0,
    results: [],
  }
  if (!resolvedEventId) return summary // no event set up yet — nothing to send for

  const ent = await getWhatsAppEntitlement(resolvedEventId)
  summary.hasPaidOrder = ent.hasPaidOrder
  summary.purchased = ent.purchased
  summary.remaining = ent.remaining

  // Nothing to send until the couple has paid for a card FOR THIS EVENT (gives
  // both the header image and the credit quota).
  if (!ent.cardImageUrl || ent.purchased <= 0) return summary

  let q = supabase
    .from('guest_contacts')
    .select('id, full_name, phone, whatsapp_phone, public_token')
    .eq('user_id', user.id)
    .eq('review_status', 'confirmed')
  if (guestIds && guestIds.length) q = q.in('id', guestIds)
  const { data: guests, error } = await q
  if (error) throw new Error(error.message)

  const sentSet = new Set(ent.alreadySentIds)
  let remaining = ent.remaining
  const now = new Date().toISOString()

  for (const g of (guests ?? []) as {
    id: string
    full_name: string
    phone: string | null
    whatsapp_phone: string | null
    public_token: string
  }[]) {
    const to = normalizePhone(g.whatsapp_phone ?? g.phone)
    if (!to) {
      summary.skipped += 1
      summary.results.push({ id: g.id, name: g.full_name, outcome: 'skipped' })
      continue
    }
    const isResend = sentSet.has(g.id)
    if (!isResend && remaining <= 0) {
      summary.blocked += 1
      summary.results.push({ id: g.id, name: g.full_name, outcome: 'blocked' })
      continue
    }

    const result = await provider.sendInvite({
      to,
      guestFirstName: firstNameOf(g.full_name),
      coupleName: ent.coupleName,
      eventCategory: ent.eventCategory,
      headerImageUrl: ent.cardImageUrl,
      token: g.public_token,
      eventId: resolvedEventId,
    })

    await supabase.from('whatsapp_messages').insert({
      user_id: user.id,
      guest_contact_id: g.id,
      event_id: resolvedEventId,
      direction: 'out',
      wamid: result.wamid ?? null,
      kind: 'invite',
      status: result.ok ? 'sent' : 'failed',
      error: result.error ?? null,
    })

    if (result.ok) {
      summary.sent += 1
      summary.results.push({ id: g.id, name: g.full_name, outcome: 'sent', resend: isResend })
      if (!isResend) {
        remaining -= 1 // consume one paid credit per newly-invited guest
        sentSet.add(g.id)
      }
      await supabase.from('guest_message_log').insert({
        user_id: user.id,
        guest_contact_id: g.id,
        event_id: resolvedEventId,
        channel: 'whatsapp',
      })
      await supabase
        .from('guest_contacts')
        .update({ last_invited_at: now })
        .eq('id', g.id)
        .eq('user_id', user.id)
    } else {
      summary.failed += 1
      summary.results.push({ id: g.id, name: g.full_name, outcome: 'failed', error: result.error })
    }
  }

  summary.remaining = remaining
  revalidateDashboard()
  return summary
}

/**
 * Send an "OpusPass Entrance Pass" — a ticket image bearing the guest's name
 * and a scannable check-in QR — to guests who have confirmed attending the
 * given event. Unlike sendWhatsAppInvites, this is NOT gated by invite
 * credits: it serves a different purpose (check-in, not the paid invite), so
 * every attending guest can always receive or re-receive one for free.
 */
export async function sendEntrancePasses(guestIds?: string[], eventId?: string): Promise<WhatsAppSendSummary> {
  const user = await requireDashboardUser()
  const supabase = createDashboardClient()
  const provider = getWhatsAppProvider()
  const resolvedEventId = await resolveDefaultEventId(eventId)

  const summary: WhatsAppSendSummary = {
    sent: 0,
    failed: 0,
    skipped: 0,
    blocked: 0,
    dryRun: !provider.live,
    hasPaidOrder: false,
    purchased: 0,
    remaining: 0,
    results: [],
  }
  if (!resolvedEventId) return summary

  const [{ data: event }, { data: profile }] = await Promise.all([
    supabase
      .from('wedding_events')
      .select('name, starts_at')
      .eq('id', resolvedEventId)
      .eq('user_id', user.id)
      .maybeSingle<{ name: string; starts_at: string | null }>(),
    supabase
      .from('couple_profiles')
      .select('partner1_name, partner2_name')
      .eq('user_id', user.id)
      .maybeSingle<{ partner1_name: string | null; partner2_name: string | null }>(),
  ])
  if (!event) return summary

  const names = [profile?.partner1_name, profile?.partner2_name].filter(Boolean)
  const coupleName = names.length ? names.join(' & ') : event.name
  const eventDate = formatLongDate(event.starts_at) || 'TBC'

  const { data: invitations } = await supabase
    .from('guest_invitations')
    .select('guest_contact_id')
    .eq('user_id', user.id)
    .eq('event_id', resolvedEventId)
    .eq('rsvp_status', 'attending')
  const attendingIds = new Set((invitations ?? []).map((i) => i.guest_contact_id as string))
  if (!attendingIds.size) return summary

  const targetIds = guestIds && guestIds.length ? guestIds.filter((id) => attendingIds.has(id)) : [...attendingIds]
  if (!targetIds.length) return summary

  const { data: guests, error } = await supabase
    .from('guest_contacts')
    .select('id, full_name, phone, whatsapp_phone, public_token')
    .eq('user_id', user.id)
    .in('id', targetIds)
  if (error) throw new Error(error.message)

  const origin = publicOrigin()

  for (const g of (guests ?? []) as {
    id: string
    full_name: string
    phone: string | null
    whatsapp_phone: string | null
    public_token: string
  }[]) {
    const to = normalizePhone(g.whatsapp_phone ?? g.phone)
    if (!to) {
      summary.skipped += 1
      summary.results.push({ id: g.id, name: g.full_name, outcome: 'skipped' })
      continue
    }

    const result = await provider.sendEntrancePass({
      to,
      guestName: firstNameOf(g.full_name),
      coupleName,
      eventName: event.name,
      eventDate,
      headerImageUrl: `${origin}/entrance-pass/${g.public_token}?event=${resolvedEventId}`,
    })

    await supabase.from('whatsapp_messages').insert({
      user_id: user.id,
      guest_contact_id: g.id,
      event_id: resolvedEventId,
      direction: 'out',
      wamid: result.wamid ?? null,
      kind: 'entrance_pass',
      status: result.ok ? 'sent' : 'failed',
      error: result.error ?? null,
    })

    if (result.ok) {
      summary.sent += 1
      summary.results.push({ id: g.id, name: g.full_name, outcome: 'sent' })
    } else {
      summary.failed += 1
      summary.results.push({ id: g.id, name: g.full_name, outcome: 'failed', error: result.error })
    }
  }

  revalidateDashboard()
  return summary
}

/** Outcome of a couple-facing test send of the invite template. */
export interface WhatsAppTestSendResult {
  ok: boolean
  dryRun: boolean
  error?: string
}

/** Editable preview values for a test send — the template's {{1}}/{{2}}/{{3}}. */
export interface TestInviteOverrides {
  guestName?: string
  coupleName?: string
  eventCategory?: string
}

/** Collapse whitespace (Meta rejects newlines/tabs in params) and cap length. */
function templateParam(value: string | undefined, fallback: string, max = 60): string {
  const clean = (value ?? '').replace(/\s+/g, ' ').trim()
  return (clean || fallback).slice(0, max)
}

/**
 * Send the invitation template to a number the COUPLE controls so they can see
 * exactly what guests receive (their real card, names and buttons) before a
 * bulk send. The couple can override the three template variables from the
 * preview. Free: not tied to a guest, never consumes invitation credits
 * (quota counts distinct guest_contact_ids with kind='invite'; this row has
 * neither). The button payloads carry a 'test' token that maps to no guest, so
 * taps are logged and ignored.
 */
export async function sendWhatsAppTestInvite(
  rawPhone: string,
  overrides?: TestInviteOverrides,
  eventId?: string,
): Promise<WhatsAppTestSendResult> {
  const user = await requireDashboardUser()
  const supabase = createDashboardClient()
  const provider = getWhatsAppProvider()
  const resolvedEventId = await resolveDefaultEventId(eventId)
  if (!resolvedEventId) return { ok: false, dryRun: !provider.live, error: 'no event set up yet' }
  const ent = await getWhatsAppEntitlement(resolvedEventId)

  const to = normalizePhone(rawPhone)
  if (!to || to.length < 9) return { ok: false, dryRun: !provider.live, error: 'invalid phone number' }
  if (!ent.cardImageUrl) return { ok: false, dryRun: !provider.live, error: 'no paid card to preview' }

  const result = await provider.sendInvite({
    to,
    guestFirstName: templateParam(overrides?.guestName, 'Rafiki'),
    coupleName: templateParam(overrides?.coupleName, ent.coupleName),
    eventCategory: templateParam(overrides?.eventCategory, ent.eventCategory),
    headerImageUrl: ent.cardImageUrl,
    token: 'test',
    eventId: resolvedEventId,
  })

  await supabase.from('whatsapp_messages').insert({
    user_id: user.id,
    guest_contact_id: null,
    event_id: resolvedEventId,
    direction: 'out',
    wamid: result.wamid ?? null,
    kind: 'invite_test',
    status: result.ok ? 'sent' : 'failed',
    error: result.error ?? null,
  })

  return { ok: result.ok, dryRun: Boolean(result.dryRun), error: result.error }
}

/**
 * Attach a paid invitation order to one of the couple's events, so its
 * design/quota becomes visible to that event's Send Invites page instead of
 * sitting unassigned. Ownership is enforced via the user_id/contact match
 * `getWhatsAppEntitlement` already uses to surface `unassignedOrders`.
 */
export async function assignOrderToEvent(orderId: string, eventId: string): Promise<void> {
  const user = await requireDashboardUser()
  const supabase = createDashboardClient()

  const { data: profile } = await supabase
    .from('couple_profiles')
    .select('whatsapp_phone')
    .eq('user_id', user.id)
    .maybeSingle<{ whatsapp_phone: string | null }>()

  const { data: event } = await supabase
    .from('wedding_events')
    .select('id')
    .eq('id', eventId)
    .eq('user_id', user.id)
    .maybeSingle<{ id: string }>()
  if (!event) throw new Error('Event not found')

  // Ownership match: a guest-checkout order (user_id NULL) may match by
  // email/phone, but an order that already carries a DIFFERENT explicit
  // user_id can never be pulled in this way — this is a write, unlike the
  // read-only entitlement lookups that historically used a looser OR-match.
  const orders = await fetchPaidOrdersForCouple(supabase, user.id, user.email, profile?.whatsapp_phone ?? null)
  const order = orders.find((o) => o.id === orderId)
  if (!order) throw new Error('Order not found')

  const { error } = await supabase.from('invitation_orders').update({ event_id: eventId }).eq('id', orderId)
  if (error) throw new Error(error.message)
  revalidateDashboard()
}

/** Undo an `assignOrderToEvent` link — sends the order back to "unassigned"
 *  so it can be re-linked to the correct event instead. */
export async function unassignOrderFromEvent(orderId: string): Promise<void> {
  const user = await requireDashboardUser()
  const supabase = createDashboardClient()

  const { data: profile } = await supabase
    .from('couple_profiles')
    .select('whatsapp_phone')
    .eq('user_id', user.id)
    .maybeSingle<{ whatsapp_phone: string | null }>()

  const orders = await fetchPaidOrdersForCouple(supabase, user.id, user.email, profile?.whatsapp_phone ?? null)
  const order = orders.find((o) => o.id === orderId)
  if (!order) throw new Error('Order not found')

  const { error } = await supabase.from('invitation_orders').update({ event_id: null }).eq('id', orderId)
  if (error) throw new Error(error.message)
  revalidateDashboard()
}

/**
 * Persist the couple-confirmed WhatsApp template values: {{2}} host name and
 * {{3}} event category. Sending is blocked until these are saved once; the
 * confirm step saves them on every bulk send so edits stick.
 */
export async function saveInviteSendSettings(hostName: string, eventCategory: string): Promise<void> {
  const user = await requireDashboardUser()
  const supabase = createDashboardClient()
  const host = hostName.replace(/\s+/g, ' ').trim().slice(0, 60)
  const category = eventCategory.replace(/\s+/g, ' ').trim().slice(0, 40)
  if (!host || !category) throw new Error('Fill in who the invite is from and the event type')

  const { data: updated, error } = await supabase
    .from('couple_profiles')
    .update({ invite_host_name: host, invite_event_category: category })
    .eq('user_id', user.id)
    .select('user_id')
  if (error) throw new Error(error.message)

  if (!updated || updated.length === 0) {
    // First save with no profile row yet. partner1_name is NOT NULL, so seed
    // the partner names from the host string ("Asha & Juma" / "Asha na Juma").
    const [p1, p2] = host.split(/\s*(?:&|\bna\b)\s*/i)
    const { error: insErr } = await supabase.from('couple_profiles').insert({
      user_id: user.id,
      partner1_name: (p1?.trim() || host).slice(0, 60),
      partner2_name: p2?.trim() ? p2.trim().slice(0, 60) : null,
      invite_host_name: host,
      invite_event_category: category,
    })
    if (insErr) {
      // Concurrent first saves can race past the empty update; the loser hits
      // the user_id unique constraint — retry as a plain update instead.
      if (insErr.code === '23505') {
        const { error: retryErr } = await supabase
          .from('couple_profiles')
          .update({ invite_host_name: host, invite_event_category: category })
          .eq('user_id', user.id)
        if (retryErr) throw new Error(retryErr.message)
      } else {
        throw new Error(insErr.message)
      }
    }
  }
  revalidateDashboard()
}

/**
 * Lightweight inline edit from the Send Invites table: guest display name and
 * phone. Deliberately narrower than updateGuest (which rewrites every column
 * from a full GuestInput) so an inline edit can never clobber unrelated
 * fields. The single phone field drives BOTH phone and whatsapp_phone —
 * fixing a wrong number must fix where invites actually go.
 */
export async function updateGuestBasics(guestId: string, name: string, rawPhone: string): Promise<void> {
  const user = await requireDashboardUser()
  const supabase = createDashboardClient()
  const fullName = name.replace(/\s+/g, ' ').trim().slice(0, 120)
  if (!fullName) throw new Error('Enter the guest name')
  // A blank phone means "leave the number as it is" — an inline name fix must
  // never silently strip a guest's sendable number.
  const updatePayload: { full_name: string; phone?: string; whatsapp_phone?: string } = {
    full_name: fullName,
  }
  if (rawPhone.trim()) {
    const phone = normalizePhone(rawPhone)
    if (!phone || phone.length < 9) throw new Error('Enter a valid phone number')
    updatePayload.phone = phone
    updatePayload.whatsapp_phone = phone
  }
  const { error } = await supabase
    .from('guest_contacts')
    .update(updatePayload)
    .eq('id', guestId)
    .eq('user_id', user.id)
  if (error) throw new Error(error.message)
  revalidateDashboard()
}

/**
 * Quick inline fix from the Send Invites table: attach a phone number to a
 * guest who was skipped for having none. Also fills whatsapp_phone when empty
 * so the guest immediately becomes WhatsApp-sendable.
 */
export async function updateGuestPhone(guestId: string, rawPhone: string): Promise<void> {
  const user = await requireDashboardUser()
  const supabase = createDashboardClient()
  const phone = normalizePhone(rawPhone)
  if (!phone || phone.length < 9) throw new Error('Enter a valid phone number')

  const { data: existing, error: readErr } = await supabase
    .from('guest_contacts')
    .select('id, whatsapp_phone')
    .eq('id', guestId)
    .eq('user_id', user.id)
    .maybeSingle<{ id: string; whatsapp_phone: string | null }>()
  if (readErr) throw new Error(readErr.message)
  if (!existing) throw new Error('Guest not found')

  const { error } = await supabase
    .from('guest_contacts')
    .update({ phone, whatsapp_phone: existing.whatsapp_phone ?? phone })
    .eq('id', guestId)
    .eq('user_id', user.id)
  if (error) throw new Error(error.message)
  revalidateDashboard()
}

/** Result of a Contact Collector / Pledge WhatsApp link-request broadcast. */
export interface WhatsAppLinkSendSummary {
  sent: number
  failed: number
  /** Contacts with no usable phone number. */
  skipped: number
  /** True when handled by the dry-run stub (no live Meta account yet). */
  dryRun: boolean
}

/**
 * Send the couple's Contact Collector or Pledge link to the given saved
 * contacts via a templated WhatsApp message (image header + CTA URL button
 * pointing at /collect/<token> or /pledge/<token>). Unlike invites this isn't
 * quota-gated — it's a free-form "please fill this in" nudge.
 */
async function sendWhatsAppLinkRequests(
  kind: LinkRequestKind,
  guestIds: string[],
  token: string | null,
): Promise<WhatsAppLinkSendSummary> {
  const user = await requireDashboardUser()
  const supabase = createDashboardClient()
  const provider = getWhatsAppProvider()
  const summary: WhatsAppLinkSendSummary = { sent: 0, failed: 0, skipped: 0, dryRun: !provider.live }

  if (!token || !guestIds.length) return summary

  // Collector/pledge links are couple-level, not tied to any one event — only
  // coupleName is needed here, so any resolvable event id is sufficient.
  const resolvedEventId = await resolveDefaultEventId()
  if (!resolvedEventId) return summary
  const ent = await getWhatsAppEntitlement(resolvedEventId)
  // Generic OpusPass banner — collector/pledge links aren't tied to a paid card.
  const headerImageUrl = `${publicOrigin()}/assets/images/couples_together.jpg`

  const { data: guests, error } = await supabase
    .from('guest_contacts')
    .select('id, full_name, phone, whatsapp_phone')
    .eq('user_id', user.id)
    .in('id', guestIds)
  if (error) throw new Error(error.message)

  for (const g of (guests ?? []) as {
    id: string
    full_name: string
    phone: string | null
    whatsapp_phone: string | null
  }[]) {
    const to = normalizePhone(g.whatsapp_phone ?? g.phone)
    if (!to) {
      summary.skipped += 1
      continue
    }

    const result = await provider.sendLinkRequest(kind, {
      to,
      contactFirstName: firstNameOf(g.full_name),
      coupleName: ent.coupleName,
      headerImageUrl,
      token,
    })

    await supabase.from('whatsapp_messages').insert({
      user_id: user.id,
      guest_contact_id: g.id,
      direction: 'out',
      wamid: result.wamid ?? null,
      kind,
      status: result.ok ? 'sent' : 'failed',
      error: result.error ?? null,
    })

    if (result.ok) {
      summary.sent += 1
      await supabase.from('guest_message_log').insert({
        user_id: user.id,
        guest_contact_id: g.id,
        channel: 'whatsapp',
      })
    } else {
      summary.failed += 1
    }
  }

  revalidateDashboard()
  return summary
}

/** Send the Contact Collector link to selected saved contacts via WhatsApp. */
export async function sendWhatsAppCollectorRequests(guestIds: string[]): Promise<WhatsAppLinkSendSummary> {
  const token = await getMyCollectorToken()
  return sendWhatsAppLinkRequests('collector', guestIds, token)
}

/** Send the self-pledge link to selected saved contacts via WhatsApp. */
export async function sendWhatsAppPledgeRequests(guestIds: string[]): Promise<WhatsAppLinkSendSummary> {
  const token = await getMyPledgeToken()
  return sendWhatsAppLinkRequests('pledge', guestIds, token)
}

/**
 * Nudge already-invited guests who haven't responded yet. Reuses the same
 * approved invite template (no new Meta template needed) — resends are free
 * per sendWhatsAppInvites' existing quota logic.
 */
export async function sendWhatsAppRsvpReminders(guestIds?: string[]): Promise<WhatsAppSendSummary> {
  const user = await requireDashboardUser()
  const supabase = createDashboardClient()

  let gq = supabase
    .from('guest_contacts')
    .select('id')
    .eq('user_id', user.id)
    .eq('review_status', 'confirmed')
    .not('last_invited_at', 'is', null)
  if (guestIds && guestIds.length) gq = gq.in('id', guestIds)
  const { data: candidates } = await gq
  const candidateIds = (candidates ?? []).map((g) => g.id as string)

  const zeroSummary: WhatsAppSendSummary = {
    sent: 0,
    failed: 0,
    skipped: 0,
    blocked: 0,
    dryRun: true,
    hasPaidOrder: false,
    purchased: 0,
    remaining: 0,
    results: [],
  }
  if (!candidateIds.length) return zeroSummary

  const { data: invitations } = await supabase
    .from('guest_invitations')
    .select('guest_contact_id, rsvp_status')
    .eq('user_id', user.id)
    .in('guest_contact_id', candidateIds)

  const respondedIds = new Set(
    (invitations ?? [])
      .filter((i) => i.rsvp_status === 'attending' || i.rsvp_status === 'declined')
      .map((i) => i.guest_contact_id as string),
  )
  const pendingIds = candidateIds.filter((id) => !respondedIds.has(id))
  if (!pendingIds.length) return zeroSummary

  return sendWhatsAppInvites(pendingIds)
}

// ---------------------------------------------------------------- Seat collection

/** Add a table to an event's floor plan. Returns the new table id. */
export async function createSeatingTable(input: {
  eventId: string
  name?: string
  capacity?: number
  isHead?: boolean
}): Promise<string> {
  const user = await requireDashboardUser()
  const supabase = createDashboardClient()

  // Guard: the event must belong to the signed-in couple.
  const { data: event } = await supabase
    .from('wedding_events')
    .select('id')
    .eq('id', input.eventId)
    .eq('user_id', user.id)
    .maybeSingle<{ id: string }>()
  if (!event) throw new Error('Event not found')

  // New tables append after existing ones.
  const { data: last } = await supabase
    .from('seating_tables')
    .select('sort_order')
    .eq('user_id', user.id)
    .eq('event_id', input.eventId)
    .order('sort_order', { ascending: false })
    .limit(1)
    .maybeSingle<{ sort_order: number }>()

  const { data, error } = await supabase
    .from('seating_tables')
    .insert({
      user_id: user.id,
      event_id: input.eventId,
      name: input.name?.trim() || 'New table',
      capacity: Math.max(0, Math.floor(input.capacity ?? 10)),
      is_head: input.isHead ?? false,
      sort_order: (last?.sort_order ?? 0) + 1,
    })
    .select('id')
    .single<{ id: string }>()
  if (error || !data) throw new Error(error?.message ?? 'Failed to create table')
  revalidateDashboard()
  return data.id
}

/** Rename a table, change its capacity, or toggle its "head table" flag. */
export async function updateSeatingTable(
  tableId: string,
  input: { name?: string; capacity?: number; isHead?: boolean },
): Promise<void> {
  const user = await requireDashboardUser()
  const supabase = createDashboardClient()

  const patch: Record<string, unknown> = {}
  if (input.name !== undefined) patch.name = input.name.trim() || 'Table'
  if (input.capacity !== undefined) patch.capacity = Math.max(0, Math.floor(input.capacity))
  if (input.isHead !== undefined) patch.is_head = input.isHead
  if (Object.keys(patch).length === 0) return

  const { error } = await supabase
    .from('seating_tables')
    .update(patch)
    .eq('id', tableId)
    .eq('user_id', user.id)
  if (error) throw new Error(error.message)
  revalidateDashboard()
}

/** Remove a table. Its assignments cascade away, returning guests to the pool. */
export async function deleteSeatingTable(tableId: string): Promise<void> {
  const user = await requireDashboardUser()
  const supabase = createDashboardClient()
  const { error } = await supabase
    .from('seating_tables')
    .delete()
    .eq('id', tableId)
    .eq('user_id', user.id)
  if (error) throw new Error(error.message)
  revalidateDashboard()
}

/**
 * Seat a guest party at a table (or move them between tables). One assignment
 * per guest per event, so this upserts on (guest_contact_id, event_id).
 */
export async function assignGuestToTable(input: {
  eventId: string
  guestContactId: string
  tableId: string
}): Promise<void> {
  const user = await requireDashboardUser()
  const supabase = createDashboardClient()

  // Guard: the table must belong to this couple AND this event.
  const { data: table } = await supabase
    .from('seating_tables')
    .select('id')
    .eq('id', input.tableId)
    .eq('event_id', input.eventId)
    .eq('user_id', user.id)
    .maybeSingle<{ id: string }>()
  if (!table) throw new Error('Table not found')

  const { error } = await supabase
    .from('seating_assignments')
    .upsert(
      {
        user_id: user.id,
        event_id: input.eventId,
        table_id: input.tableId,
        guest_contact_id: input.guestContactId,
      },
      { onConflict: 'guest_contact_id,event_id' },
    )
  if (error) throw new Error(error.message)
  revalidateDashboard()
}

/** Return a guest to the "to be seated" pool for an event. */
export async function unassignGuest(input: {
  eventId: string
  guestContactId: string
}): Promise<void> {
  const user = await requireDashboardUser()
  const supabase = createDashboardClient()
  const { error } = await supabase
    .from('seating_assignments')
    .delete()
    .eq('user_id', user.id)
    .eq('event_id', input.eventId)
    .eq('guest_contact_id', input.guestContactId)
  if (error) throw new Error(error.message)
  revalidateDashboard()
}
