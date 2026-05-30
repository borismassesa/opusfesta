import 'server-only'
import { createDashboardClient } from './supabase'
import { requireDashboardUser } from './auth'
import type { PledgePageConfig, PledgePaymentMethod } from './pledge-page'
import type {
  DashboardStats,
  EventPledge,
  GuestInvitation,
  GuestWithInvitations,
  PledgeStats,
  PledgeWithContact,
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

// ──────────────────────────────── Pledges ────────────────────────────────

/** Fields selected from guest_contacts to enrich each pledge row. */
interface PledgeContactRow {
  id: string
  full_name: string
  email: string | null
  phone: string | null
  whatsapp_phone: string | null
  group_tag: string | null
  public_token: string
}

export async function getPledges(): Promise<PledgeWithContact[]> {
  const user = await requireDashboardUser()
  const supabase = createDashboardClient()

  const [{ data: pledges, error: pErr }, { data: contacts, error: cErr }] = await Promise.all([
    supabase
      .from('event_pledges')
      .select('*')
      .eq('user_id', user.id)
      .order('created_at', { ascending: false }),
    supabase
      .from('guest_contacts')
      .select('id, full_name, email, phone, whatsapp_phone, group_tag, public_token')
      .eq('user_id', user.id),
  ])
  if (pErr) throw new Error(pErr.message)
  if (cErr) throw new Error(cErr.message)

  const byId = new Map<string, PledgeContactRow>(
    ((contacts ?? []) as PledgeContactRow[]).map((c) => [c.id, c]),
  )

  return ((pledges ?? []) as EventPledge[]).map((p) => {
    const c = byId.get(p.guest_contact_id)
    return {
      ...p,
      pledged_amount: Number(p.pledged_amount),
      amount_received: Number(p.amount_received),
      full_name: c?.full_name ?? 'Contributor',
      email: c?.email ?? null,
      phone: c?.phone ?? null,
      whatsapp_phone: c?.whatsapp_phone ?? null,
      group_tag: c?.group_tag ?? null,
      public_token: c?.public_token ?? '',
    }
  })
}

export async function getPledgeStats(): Promise<PledgeStats> {
  const pledges = await getPledges()
  let totalPledged = 0
  let totalReceived = 0
  let paidCount = 0
  let attendingCount = 0
  let cardsToPrepare = 0

  for (const p of pledges) {
    if (p.status !== 'declined') totalPledged += p.pledged_amount
    totalReceived += p.amount_received
    if (p.status === 'paid') paidCount += 1
    if (p.will_attend === 'yes') attendingCount += 1
    // Card prep queue: they paid, confirmed they're coming, card not yet sent.
    if (p.status === 'paid' && p.will_attend === 'yes' && p.card_status !== 'sent') {
      cardsToPrepare += 1
    }
  }

  return {
    totalPledges: pledges.length,
    totalPledged,
    totalReceived,
    outstanding: Math.max(0, totalPledged - totalReceived),
    paidCount,
    attendingCount,
    cardsToPrepare,
  }
}

/** The signed-in couple's public self-pledge token (shareable via WhatsApp). */
export async function getMyPledgeToken(): Promise<string | null> {
  const user = await requireDashboardUser()
  const supabase = createDashboardClient()
  const { data } = await supabase
    .from('users')
    .select('pledge_token')
    .eq('id', user.id)
    .maybeSingle<{ pledge_token: string | null }>()
  return data?.pledge_token ?? null
}

/** Public, token-scoped couple summary for the self-pledge page (no auth). */
export interface PublicPledgeCouple {
  coupleName: string
  weddingDate: string | null
  city: string | null
  paymentInstructions: string | null
  paymentMethods: PledgePaymentMethod[]
  pageConfig: PledgePageConfig
}

export async function getPublicPledgeCouple(token: string): Promise<PublicPledgeCouple | null> {
  const supabase = createDashboardClient()
  const { data: owner, error: ownerErr } = await supabase
    .from('users')
    .select('id')
    .eq('pledge_token', token)
    .maybeSingle<{ id: string }>()
  if (ownerErr) {
    console.error('[pledge] owner lookup failed', ownerErr)
    throw ownerErr
  }
  if (!owner) return null

  const { data: profile } = await supabase
    .from('couple_profiles')
    .select(
      'partner1_name, partner2_name, wedding_date, city, pledge_payment_instructions, pledge_payment_methods, pledge_page',
    )
    .eq('user_id', owner.id)
    .maybeSingle<{
      partner1_name: string | null
      partner2_name: string | null
      wedding_date: string | null
      city: string | null
      pledge_payment_instructions: string | null
      pledge_payment_methods: PledgePaymentMethod[] | null
      pledge_page: PledgePageConfig | null
    }>()

  const names = [profile?.partner1_name, profile?.partner2_name].filter(Boolean)
  return {
    coupleName: names.length ? names.join(' & ') : 'The Couple',
    weddingDate: profile?.wedding_date ?? null,
    city: profile?.city ?? null,
    paymentInstructions: profile?.pledge_payment_instructions ?? null,
    paymentMethods: profile?.pledge_payment_methods ?? [],
    pageConfig: profile?.pledge_page ?? {},
  }
}

/** The signed-in couple's saved pledge-page customizations (for the editor). */
export async function getMyPledgePageConfig(): Promise<PledgePageConfig> {
  const user = await requireDashboardUser()
  const supabase = createDashboardClient()
  const { data } = await supabase
    .from('couple_profiles')
    .select('pledge_page')
    .eq('user_id', user.id)
    .maybeSingle<{ pledge_page: PledgePageConfig | null }>()
  return data?.pledge_page ?? {}
}

/** The signed-in couple's saved Contact Collector page customizations. */
export async function getMyCollectorPageConfig(): Promise<PledgePageConfig> {
  const user = await requireDashboardUser()
  const supabase = createDashboardClient()
  const { data } = await supabase
    .from('couple_profiles')
    .select('collector_page')
    .eq('user_id', user.id)
    .maybeSingle<{ collector_page: PledgePageConfig | null }>()
  return data?.collector_page ?? {}
}

export interface CoupleProfileLite {
  partner1_name: string | null
  partner2_name: string | null
  wedding_date: string | null
  whatsapp_phone: string | null
  city: string | null
  pledge_payment_instructions: string | null
  pledge_payment_methods: PledgePaymentMethod[] | null
  pledge_goal_amount: number | null
}

export async function getCoupleProfile(): Promise<CoupleProfileLite | null> {
  const user = await requireDashboardUser()
  const supabase = createDashboardClient()
  const { data } = await supabase
    .from('couple_profiles')
    .select(
      'partner1_name, partner2_name, wedding_date, whatsapp_phone, city, pledge_payment_instructions, pledge_payment_methods, pledge_goal_amount',
    )
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

