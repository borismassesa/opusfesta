import 'server-only'
import { createDashboardClient } from './supabase'
import { requireDashboardUser } from './auth'
import type {
  DashboardStats,
  GuestInvitation,
  GuestWithInvitations,
  WeddingEvent,
} from './types'

export async function getEvents(): Promise<WeddingEvent[]> {
  const user = await requireDashboardUser()
  const supabase = createDashboardClient()
  const { data, error } = await supabase
    .from('wedding_events')
    .select('*')
    .eq('user_id', user.id)
    .order('sort_order', { ascending: true })
    .order('starts_at', { ascending: true, nullsFirst: false })
  if (error) throw new Error(error.message)
  return (data ?? []) as WeddingEvent[]
}

export async function getGuestsWithInvitations(): Promise<GuestWithInvitations[]> {
  const user = await requireDashboardUser()
  const supabase = createDashboardClient()

  const [{ data: guests, error: gErr }, { data: invitations, error: iErr }] = await Promise.all([
    supabase
      .from('guest_contacts')
      .select('*')
      .eq('user_id', user.id)
      .order('created_at', { ascending: false }),
    supabase.from('guest_invitations').select('*').eq('user_id', user.id),
  ])
  if (gErr) throw new Error(gErr.message)
  if (iErr) throw new Error(iErr.message)

  const byGuest = new Map<string, GuestInvitation[]>()
  for (const inv of (invitations ?? []) as GuestInvitation[]) {
    const list = byGuest.get(inv.guest_contact_id) ?? []
    list.push(inv)
    byGuest.set(inv.guest_contact_id, list)
  }

  return ((guests ?? []) as GuestWithInvitations[]).map((g) => ({
    ...g,
    invitations: byGuest.get(g.id) ?? [],
  }))
}

export async function getStats(): Promise<DashboardStats> {
  const guests = await getGuestsWithInvitations()

  let attending = 0
  let declined = 0
  let maybe = 0
  let pending = 0
  let expectedHeadcount = 0
  let invitedGuests = 0
  let respondedInvites = 0
  let totalInvites = 0
  const meals = new Map<string, number>()

  for (const guest of guests) {
    if (guest.invitations.length > 0) invitedGuests += 1
    for (const inv of guest.invitations) {
      totalInvites += 1
      switch (inv.rsvp_status) {
        case 'attending':
          attending += 1
          respondedInvites += 1
          expectedHeadcount += inv.party_size
          if (inv.meal_choice) meals.set(inv.meal_choice, (meals.get(inv.meal_choice) ?? 0) + inv.party_size)
          break
        case 'declined':
          declined += 1
          respondedInvites += 1
          break
        case 'maybe':
          maybe += 1
          respondedInvites += 1
          break
        default:
          pending += 1
      }
    }
  }

  return {
    totalGuests: guests.length,
    invitedGuests,
    attending,
    declined,
    maybe,
    pending,
    expectedHeadcount,
    responseRate: totalInvites === 0 ? 0 : Math.round((respondedInvites / totalInvites) * 100),
    mealBreakdown: [...meals.entries()]
      .map(([choice, count]) => ({ choice, count }))
      .sort((a, b) => b.count - a.count),
  }
}

export interface CoupleProfileLite {
  partner1_name: string | null
  partner2_name: string | null
  wedding_date: string | null
  whatsapp_phone: string | null
  city: string | null
}

export async function getCoupleProfile(): Promise<CoupleProfileLite | null> {
  const user = await requireDashboardUser()
  const supabase = createDashboardClient()
  const { data } = await supabase
    .from('couple_profiles')
    .select('partner1_name, partner2_name, wedding_date, whatsapp_phone, city')
    .eq('user_id', user.id)
    .maybeSingle<CoupleProfileLite>()
  return data ?? null
}

export function coupleDisplayName(profile: CoupleProfileLite | null): string {
  if (!profile) return 'The Couple'
  const names = [profile.partner1_name, profile.partner2_name].filter(Boolean)
  if (names.length === 0) return 'The Couple'
  return names.join(' & ')
}

/** The signed-in couple's Contact Collector token (shareable via WhatsApp). */
export async function getMyCollectorToken(): Promise<string | null> {
  const user = await requireDashboardUser()
  const supabase = createDashboardClient()
  const { data } = await supabase
    .from('users')
    .select('collector_token')
    .eq('id', user.id)
    .maybeSingle<{ collector_token: string | null }>()
  return data?.collector_token ?? null
}

/** Public, token-scoped fetch for the guest RSVP page (no auth). */
export interface PublicRsvpData {
  guest: {
    id: string
    full_name: string
    max_party_size: number
    public_token: string
  }
  coupleName: string
  weddingDate: string | null
  events: (WeddingEvent & { invitation: GuestInvitation })[]
}

export async function getPublicRsvpData(token: string): Promise<PublicRsvpData | null> {
  const supabase = createDashboardClient()

  const { data: guest } = await supabase
    .from('guest_contacts')
    .select('id, user_id, full_name, max_party_size, public_token')
    .eq('public_token', token)
    .maybeSingle<{
      id: string
      user_id: string
      full_name: string
      max_party_size: number
      public_token: string
    }>()
  if (!guest) return null

  const { data: invitations } = await supabase
    .from('guest_invitations')
    .select('*')
    .eq('guest_contact_id', guest.id)

  const invs = (invitations ?? []) as GuestInvitation[]
  if (invs.length === 0) {
    return {
      guest: {
        id: guest.id,
        full_name: guest.full_name,
        max_party_size: guest.max_party_size,
        public_token: guest.public_token,
      },
      coupleName: 'The Couple',
      weddingDate: null,
      events: [],
    }
  }

  const eventIds = invs.map((i) => i.event_id)
  const [{ data: events }, { data: profile }] = await Promise.all([
    // Scope to the guest's owner so a public page can only ever show this couple's events.
    supabase.from('wedding_events').select('*').eq('user_id', guest.user_id).in('id', eventIds),
    supabase
      .from('couple_profiles')
      .select('partner1_name, partner2_name, wedding_date')
      .eq('user_id', guest.user_id)
      .maybeSingle<{ partner1_name: string | null; partner2_name: string | null; wedding_date: string | null }>(),
  ])

  const eventById = new Map((events ?? []).map((e) => [e.id, e as WeddingEvent]))
  const merged = invs
    .map((inv) => {
      const ev = eventById.get(inv.event_id)
      return ev ? { ...ev, invitation: inv } : null
    })
    .filter((x): x is WeddingEvent & { invitation: GuestInvitation } => x !== null)
    .sort((a, b) => a.sort_order - b.sort_order)

  const names = [profile?.partner1_name, profile?.partner2_name].filter(Boolean)
  return {
    guest: {
      id: guest.id,
      full_name: guest.full_name,
      max_party_size: guest.max_party_size,
      public_token: guest.public_token,
    },
    coupleName: names.length ? names.join(' & ') : 'The Couple',
    weddingDate: profile?.wedding_date ?? null,
    events: merged,
  }
}

