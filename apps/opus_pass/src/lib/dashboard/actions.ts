'use server'

import { revalidatePath } from 'next/cache'
import { createDashboardClient } from './supabase'
import { requireDashboardUser } from './auth'
import type { EventType, RsvpStatus, SendChannel } from './types'

function revalidateDashboard() {
  revalidatePath('/my/dashboard')
  revalidatePath('/my/dashboard/guests')
  revalidatePath('/my/dashboard/events')
  revalidatePath('/my/dashboard/invitations')
  revalidatePath('/my/dashboard/rsvps')
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
  full_name: string
  email?: string | null
  phone?: string | null
  whatsapp_phone?: string | null
  group_tag?: string | null
  max_party_size?: number
  notes?: string | null
  /** Event ids this guest should be invited to (syncs invitations). */
  eventIds?: string[]
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
    .insert({
      user_id: user.id,
      full_name: input.full_name.trim(),
      email: input.email || null,
      phone: input.phone || null,
      whatsapp_phone: input.whatsapp_phone || null,
      group_tag: input.group_tag || null,
      max_party_size: input.max_party_size ?? 1,
      notes: input.notes || null,
    })
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
    .update({
      full_name: input.full_name.trim(),
      email: input.email || null,
      phone: input.phone || null,
      whatsapp_phone: input.whatsapp_phone || null,
      group_tag: input.group_tag || null,
      max_party_size: input.max_party_size ?? 1,
      notes: input.notes || null,
    })
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

  await supabase.from('guest_message_log').insert({ user_id: user.id, guest_contact_id: guestId, channel })
  revalidateDashboard()
}

// ---------------------------------------------------------------- Couple profile

export interface CoupleProfileInput {
  partner1_name: string
  partner2_name?: string | null
  wedding_date?: string | null
  whatsapp_phone?: string | null
  city?: string | null
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
      updated_at: new Date().toISOString(),
    },
    { onConflict: 'user_id' }
  )
  if (error) throw new Error(error.message)
  revalidatePath('/my/dashboard/settings')
  revalidateDashboard()
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
  const { data: guest } = await supabase
    .from('guest_contacts')
    .select('id, max_party_size')
    .eq('public_token', token)
    .maybeSingle<{ id: string; max_party_size: number }>()
  if (!guest) return { ok: false, error: 'Invitation not found.' }

  // Only allow updates to invitations that belong to this guest.
  const { data: owned } = await supabase
    .from('guest_invitations')
    .select('id')
    .eq('guest_contact_id', guest.id)
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
