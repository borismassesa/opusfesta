import 'server-only'
import { createDashboardClient } from './supabase'
import { getDashboardUser, requireDashboardUser } from './auth'
import { formatLongDate, publicOrigin } from './share'
import { getWhatsAppProvider } from '@/lib/whatsapp'
import { eventTypeLabel, eventTypeLabelSw } from './types'
import type { PledgePageConfig, PledgePaymentMethod } from './pledge-page'
import type { SiteDoc } from '@/lib/builder/types'
import type {
  DashboardStats,
  EventPledge,
  GuestInvitation,
  GuestWithInvitations,
  LastSend,
  PledgeStats,
  PledgeWithContact,
  RsvpAnswer,
  RsvpQuestion,
  SeatableGuest,
  SeatingData,
  SeatingTable,
  SendChannel,
  WeddingEvent,
} from './types'

/** Normalize a raw rsvp_questions row (JSONB options) into a typed question. */
function toRsvpQuestion(row: Record<string, unknown>): RsvpQuestion {
  const rawOptions = Array.isArray(row.options) ? row.options : []
  return {
    id: row.id as string,
    event_id: (row.event_id as string | null) ?? null,
    prompt: (row.prompt as string) ?? '',
    description: (row.description as string | null) ?? null,
    kind: (row.kind as RsvpQuestion['kind']) ?? 'short_answer',
    required: Boolean(row.required),
    attending_only: Boolean(row.attending_only),
    options: rawOptions.map((o) => {
      const opt = (o ?? {}) as Record<string, unknown>
      return {
        id: (opt.id as string) ?? '',
        label: (opt.label as string) ?? '',
        description: (opt.description as string | null) ?? null,
      }
    }),
    sort_order: Number(row.sort_order ?? 0),
    created_at: row.created_at as string,
    updated_at: row.updated_at as string,
  }
}

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

/**
 * Events for the checkout event picker. Unlike `getEvents()`, this never
 * redirects — guest/anonymous checkout has no couple account and simply gets
 * no picker (single implicit "unassigned" order, same as today).
 */
export async function getEventsForCheckout(
  locale: 'en' | 'sw' = 'en',
): Promise<{ id: string; name: string; eventTypeLabel: string }[]> {
  const user = await getDashboardUser()
  if (!user) return []
  const events = await getEvents()
  const label = locale === 'sw' ? eventTypeLabelSw : eventTypeLabel
  return events.map((e) => ({ id: e.id, name: e.name, eventTypeLabel: label(e.event_type) }))
}

/** Returns only the event ids that belong to this user — prevents attaching a
 *  guest (or an order) to another couple's event (the FK only checks
 *  existence, not ownership). */
export async function ownedEventIds(userId: string, eventIds: string[]): Promise<string[]> {
  if (eventIds.length === 0) return []
  const supabase = createDashboardClient()
  const { data } = await supabase
    .from('wedding_events')
    .select('id')
    .eq('user_id', userId)
    .in('id', eventIds)
  return (data ?? []).map((r) => r.id as string)
}

/** Verifies `eventId` belongs to `userId` before it's trusted on a paid order. */
export async function resolveOwnedEventId(
  userId: string,
  eventId?: string | null,
): Promise<string | null> {
  if (!eventId) return null
  try {
    const [owned] = await ownedEventIds(userId, [eventId])
    return owned ?? null
  } catch {
    // Malformed id (or transient query failure) — treat as unowned rather
    // than letting a payment request 500 on a bad eventId.
    return null
  }
}

/** All RSVP questions the couple has configured (per-event + general). */
export async function getRsvpQuestions(): Promise<RsvpQuestion[]> {
  const user = await requireDashboardUser()
  const supabase = createDashboardClient()
  const { data, error } = await supabase
    .from('rsvp_questions')
    .select('*')
    .eq('user_id', user.id)
    .order('sort_order', { ascending: true })
    .order('created_at', { ascending: true })
  if (error) throw new Error(error.message)
  return (data ?? []).map((r) => toRsvpQuestion(r as Record<string, unknown>))
}

/** A tally of guest answers to one question, for the management dashboard. */
export interface RsvpAnswerSummary {
  total: number
  /** For multiple_choice: response count per option label. */
  byOption: { label: string; count: number }[]
}

/** Answer tallies keyed by question_id, across all of the couple's questions. */
export async function getRsvpAnswerSummaries(): Promise<Record<string, RsvpAnswerSummary>> {
  const user = await requireDashboardUser()
  const supabase = createDashboardClient()
  const { data, error } = await supabase
    .from('rsvp_answers')
    .select('question_id, answer_text, option_id')
    .eq('user_id', user.id)
  if (error) throw new Error(error.message)

  const byQuestion: Record<string, { total: number; options: Map<string, number> }> = {}
  for (const a of (data ?? []) as { question_id: string; answer_text: string | null; option_id: string | null }[]) {
    const entry = (byQuestion[a.question_id] ??= { total: 0, options: new Map() })
    entry.total += 1
    if (a.option_id) {
      const label = a.answer_text || 'Selected'
      entry.options.set(label, (entry.options.get(label) ?? 0) + 1)
    }
  }

  const out: Record<string, RsvpAnswerSummary> = {}
  for (const [qid, e] of Object.entries(byQuestion)) {
    out[qid] = {
      total: e.total,
      byOption: [...e.options.entries()].map(([label, count]) => ({ label, count })).sort((a, b) => b.count - a.count),
    }
  }
  return out
}

/** Per-event RSVP tallies for the management dashboard donut. */
export interface RsvpEventSummary {
  event: WeddingEvent
  invited: number
  accepted: number
  declined: number
  maybe: number
  noResponse: number
}

export async function getRsvpEventSummaries(): Promise<RsvpEventSummary[]> {
  const user = await requireDashboardUser()
  const supabase = createDashboardClient()
  const [{ data: events, error: eErr }, { data: invitations, error: iErr }] = await Promise.all([
    supabase
      .from('wedding_events')
      .select('*')
      .eq('user_id', user.id)
      .order('sort_order', { ascending: true }),
    supabase.from('guest_invitations').select('event_id, rsvp_status').eq('user_id', user.id),
  ])
  if (eErr) throw new Error(eErr.message)
  if (iErr) throw new Error(iErr.message)

  const byEvent = new Map<string, { invited: number; accepted: number; declined: number; maybe: number }>()
  for (const inv of (invitations ?? []) as { event_id: string; rsvp_status: string }[]) {
    const t = byEvent.get(inv.event_id) ?? { invited: 0, accepted: 0, declined: 0, maybe: 0 }
    t.invited += 1
    if (inv.rsvp_status === 'attending') t.accepted += 1
    else if (inv.rsvp_status === 'declined') t.declined += 1
    else if (inv.rsvp_status === 'maybe') t.maybe += 1
    byEvent.set(inv.event_id, t)
  }

  return ((events ?? []) as WeddingEvent[]).map((event) => {
    const t = byEvent.get(event.id) ?? { invited: 0, accepted: 0, declined: 0, maybe: 0 }
    return {
      event,
      invited: t.invited,
      accepted: t.accepted,
      declined: t.declined,
      maybe: t.maybe,
      noResponse: Math.max(0, t.invited - t.accepted - t.declined - t.maybe),
    }
  })
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

/** When/how each guest was last contacted — keyed by guest_contact_id.
 *  Powers the "Replied via" column on the RSVP tracker. Latest send wins. */
export async function getLastSendByGuest(): Promise<Record<string, LastSend>> {
  const user = await requireDashboardUser()
  const supabase = createDashboardClient()
  const { data } = await supabase
    .from('guest_message_log')
    .select('guest_contact_id, channel, created_at')
    .eq('user_id', user.id)
    .order('created_at', { ascending: false })

  const map: Record<string, LastSend> = {}
  for (const row of (data ?? []) as {
    guest_contact_id: string
    channel: SendChannel
    created_at: string
  }[]) {
    // Rows arrive newest-first, so the first one seen per guest is the latest.
    if (!map[row.guest_contact_id]) {
      map[row.guest_contact_id] = { channel: row.channel, at: row.created_at }
    }
  }
  return map
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

// ──────────────────────────────── Seat collection ────────────────────────────────

/**
 * The seating planner for one event: its tables, plus every attending guest
 * party (confirmed roster only) tagged with the table they're seated at — or
 * null when still in the "to be seated" pool. Returns null when the event isn't
 * found / not owned by the signed-in couple.
 *
 * Seats a party occupies come from their attending invitation's `party_size`
 * (live, not denormalized), so editing a headcount updates the plan immediately.
 */
export async function getSeatingData(eventId: string): Promise<SeatingData | null> {
  const user = await requireDashboardUser()
  const supabase = createDashboardClient()

  const { data: event } = await supabase
    .from('wedding_events')
    .select('*')
    .eq('id', eventId)
    .eq('user_id', user.id)
    .maybeSingle<WeddingEvent>()
  if (!event) return null

  const [{ data: tables, error: tErr }, { data: invitations, error: iErr }, { data: assignments, error: aErr }] =
    await Promise.all([
      supabase
        .from('seating_tables')
        .select('*')
        .eq('user_id', user.id)
        .eq('event_id', eventId)
        .order('is_head', { ascending: false })
        .order('sort_order', { ascending: true })
        .order('created_at', { ascending: true }),
      supabase
        .from('guest_invitations')
        .select('guest_contact_id, party_size, meal_choice, dietary_notes')
        .eq('user_id', user.id)
        .eq('event_id', eventId)
        .eq('rsvp_status', 'attending'),
      supabase
        .from('seating_assignments')
        .select('guest_contact_id, table_id')
        .eq('user_id', user.id)
        .eq('event_id', eventId),
    ])
  if (tErr) throw new Error(tErr.message)
  if (iErr) throw new Error(iErr.message)
  if (aErr) throw new Error(aErr.message)

  const attending = (invitations ?? []) as {
    guest_contact_id: string
    party_size: number
    meal_choice: string | null
    dietary_notes: string | null
  }[]

  // Name + group for each attending guest (skip public self-RSVPs awaiting review).
  const guestIds = attending.map((i) => i.guest_contact_id)
  const contactById = new Map<string, { full_name: string; group_tag: string | null }>()
  if (guestIds.length > 0) {
    const { data: contacts } = await supabase
      .from('guest_contacts')
      .select('id, full_name, group_tag, review_status')
      .eq('user_id', user.id)
      .in('id', guestIds)
    for (const c of (contacts ?? []) as {
      id: string
      full_name: string
      group_tag: string | null
      review_status: string
    }[]) {
      if (c.review_status === 'unconfirmed') continue
      contactById.set(c.id, { full_name: c.full_name, group_tag: c.group_tag })
    }
  }

  const tableById = new Map((tables ?? []).map((t) => [t.id as string, t as SeatingTable]))
  const tableByGuest = new Map<string, string>()
  for (const a of (assignments ?? []) as { guest_contact_id: string; table_id: string }[]) {
    // Ignore stale assignments whose table was removed.
    if (tableById.has(a.table_id)) tableByGuest.set(a.guest_contact_id, a.table_id)
  }

  const guests: SeatableGuest[] = attending
    .map((inv) => {
      const contact = contactById.get(inv.guest_contact_id)
      if (!contact) return null
      return {
        guest_contact_id: inv.guest_contact_id,
        full_name: contact.full_name,
        seats: Math.max(1, inv.party_size ?? 1),
        meal_choice: inv.meal_choice,
        dietary_notes: inv.dietary_notes,
        group_tag: contact.group_tag,
        table_id: tableByGuest.get(inv.guest_contact_id) ?? null,
      }
    })
    .filter((g): g is SeatableGuest => g !== null)
    .sort((a, b) => a.full_name.localeCompare(b.full_name))

  return { event, tables: (tables ?? []) as SeatingTable[], guests }
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
  const coupleName = names.length ? names.join(' & ') : await fallbackCoupleNameFromEvent(supabase, owner.id)
  return {
    coupleName,
    weddingDate: profile?.wedding_date ?? null,
    city: profile?.city ?? null,
    paymentInstructions: profile?.pledge_payment_instructions ?? null,
    paymentMethods: profile?.pledge_payment_methods ?? [],
    pageConfig: profile?.pledge_page ?? {},
  }
}

/** No partner names on the profile? Fall back to the couple's earliest event's
 *  own title (e.g. "Asha & Juma's Wedding") before the generic placeholder. */
export async function fallbackCoupleNameFromEvent(
  supabase: ReturnType<typeof createDashboardClient>,
  userId: string,
): Promise<string> {
  const { data: primaryEvent } = await supabase
    .from('wedding_events')
    .select('name')
    .eq('user_id', userId)
    .order('sort_order', { ascending: true })
    .order('starts_at', { ascending: true, nullsFirst: false })
    .limit(1)
    .maybeSingle<{ name: string | null }>()
  return primaryEvent?.name?.trim() || 'The Couple'
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
  /** Per-event follow-up questions, keyed by event_id. */
  questionsByEvent: Record<string, RsvpQuestion[]>
  /** General questions asked to everyone who RSVPs (event_id NULL). */
  generalQuestions: RsvpQuestion[]
  /** Prior answers keyed by guest_invitation_id -> question_id -> answer. */
  answers: Record<string, Record<string, RsvpAnswer>>
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
      questionsByEvent: {},
      generalQuestions: [],
      answers: {},
    }
  }

  const eventIds = invs.map((i) => i.event_id)
  const invitationIds = invs.map((i) => i.id)
  const [{ data: events }, { data: profile }, { data: questionRows }, { data: answerRows }] = await Promise.all([
    // Scope to the guest's owner so a public page can only ever show this couple's events.
    supabase.from('wedding_events').select('*').eq('user_id', guest.user_id).in('id', eventIds),
    supabase
      .from('couple_profiles')
      .select('partner1_name, partner2_name, wedding_date')
      .eq('user_id', guest.user_id)
      .maybeSingle<{ partner1_name: string | null; partner2_name: string | null; wedding_date: string | null }>(),
    // General questions (event_id NULL) + follow-ups for the guest's events.
    supabase
      .from('rsvp_questions')
      .select('*')
      .eq('user_id', guest.user_id)
      .order('sort_order', { ascending: true })
      .order('created_at', { ascending: true }),
    supabase.from('rsvp_answers').select('*').in('guest_invitation_id', invitationIds),
  ])

  const allQuestions = (questionRows ?? []).map((r) => toRsvpQuestion(r as Record<string, unknown>))
  const eventIdSet = new Set(eventIds)
  const questionsByEvent: Record<string, RsvpQuestion[]> = {}
  const generalQuestions: RsvpQuestion[] = []
  for (const q of allQuestions) {
    if (q.event_id === null) {
      generalQuestions.push(q)
    } else if (eventIdSet.has(q.event_id)) {
      ;(questionsByEvent[q.event_id] ??= []).push(q)
    }
  }

  const answers: Record<string, Record<string, RsvpAnswer>> = {}
  for (const a of (answerRows ?? []) as RsvpAnswer[]) {
    ;(answers[a.guest_invitation_id] ??= {})[a.question_id] = a
  }

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
    questionsByEvent,
    generalQuestions,
    answers,
  }
}

// ──────────────────────────── Public invitation hub ────────────────────────────

/** A non-PII projection of an event for the public /i/<slug> hub + OG card. */
export interface PublicInviteEvent {
  id: string
  name: string
  event_type: string
  description: string | null
  venue_name: string | null
  address: string | null
  city: string | null
  starts_at: string | null
  ends_at: string | null
  dress_code: string | null
  allow_rsvp: boolean
}

export interface PublicInviteData {
  slug: string
  coupleName: string
  weddingDate: string | null
  city: string | null
  coverImageUrl: string | null
  /** True once the wedding date has passed — the hub closes RSVPs. */
  hasPassed: boolean
  /** Any public event accepts RSVPs AND the wedding hasn't passed. */
  allowRsvp: boolean
  events: PublicInviteEvent[]
  /** General questions (asked to everyone who RSVPs) for the combined hub RSVP. */
  generalQuestions: RsvpQuestion[]
}

/**
 * Public, slug-scoped fetch for the shareable invitation hub (no auth, no PII).
 * Returns null when the slug is unknown or the couple has sharing disabled —
 * so a revoked link 404s. Reads run through the service-role client; only the
 * non-PII projection above is ever exposed.
 */
/**
 * Public, slug-scoped fetch of a PUBLISHED wedding website (the full SiteDoc).
 * Returns null when the slug is unknown, the site isn't published, or sharing
 * is disabled — so a revoked link 404s. Service-role read; the doc is non-PII.
 */
export async function getPublishedWebsite(slug: string): Promise<SiteDoc | null> {
  if (!slug) return null
  const supabase = createDashboardClient()
  const { data, error } = await supabase
    .from('couple_profiles')
    .select('website_doc, website_published_at, public_sharing_enabled')
    .eq('public_slug', slug)
    .maybeSingle<{
      website_doc: SiteDoc | null
      website_published_at: string | null
      public_sharing_enabled: boolean
    }>()
  if (error) {
    console.error('[published-website] lookup failed', error)
    return null
  }
  if (!data || !data.website_doc || !data.website_published_at || !data.public_sharing_enabled) {
    return null
  }
  // Defensive: only serve a well-formed v2 doc (composeDoc requires meta). A
  // malformed/legacy doc 404s instead of 500-ing the public route.
  if (!data.website_doc.meta || !Array.isArray(data.website_doc.sections)) return null
  return data.website_doc
}

export async function getPublicInvite(slug: string): Promise<PublicInviteData | null> {
  if (!slug) return null
  const supabase = createDashboardClient()

  const { data: profile, error } = await supabase
    .from('couple_profiles')
    .select(
      'user_id, partner1_name, partner2_name, wedding_date, city, cover_image_url, public_sharing_enabled',
    )
    .eq('public_slug', slug)
    .maybeSingle<{
      user_id: string
      partner1_name: string | null
      partner2_name: string | null
      wedding_date: string | null
      city: string | null
      cover_image_url: string | null
      public_sharing_enabled: boolean
    }>()
  if (error) {
    console.error('[public-invite] profile lookup failed', error)
    throw error
  }
  if (!profile || !profile.public_sharing_enabled) return null

  const { data: events } = await supabase
    .from('wedding_events')
    .select(
      'id, name, event_type, description, venue_name, address, city, starts_at, ends_at, dress_code, allow_rsvp, sort_order',
    )
    .eq('user_id', profile.user_id)
    .eq('is_public', true)
    .order('sort_order', { ascending: true })
    .order('starts_at', { ascending: true, nullsFirst: false })

  const publicEvents: PublicInviteEvent[] = (events ?? []).map((e) => ({
    id: e.id as string,
    name: e.name as string,
    event_type: e.event_type as string,
    description: (e.description as string | null) ?? null,
    venue_name: (e.venue_name as string | null) ?? null,
    address: (e.address as string | null) ?? null,
    city: (e.city as string | null) ?? null,
    starts_at: (e.starts_at as string | null) ?? null,
    ends_at: (e.ends_at as string | null) ?? null,
    dress_code: (e.dress_code as string | null) ?? null,
    allow_rsvp: Boolean(e.allow_rsvp),
  }))

  const { data: generalRows } = await supabase
    .from('rsvp_questions')
    .select('*')
    .eq('user_id', profile.user_id)
    .is('event_id', null)
    .order('sort_order', { ascending: true })
    .order('created_at', { ascending: true })
  const generalQuestions = (generalRows ?? []).map((r) => toRsvpQuestion(r as Record<string, unknown>))

  const names = [profile.partner1_name, profile.partner2_name].filter(Boolean)
  const hasPassed = profile.wedding_date ? profile.wedding_date < todayISODate() : false

  return {
    slug,
    coupleName: names.length ? names.join(' & ') : 'The Couple',
    weddingDate: profile.wedding_date,
    city: profile.city,
    coverImageUrl: profile.cover_image_url,
    hasPassed,
    allowRsvp: !hasPassed && publicEvents.some((e) => e.allow_rsvp),
    events: publicEvents,
    generalQuestions,
  }
}

/** Today's date as YYYY-MM-DD (wedding_date is a DATE column). */
function todayISODate(): string {
  return new Date().toISOString().slice(0, 10)
}

/** The signed-in couple's public-invite sharing state (for the dashboard). */
export interface MyPublicInvite {
  slug: string | null
  enabled: boolean
  coverImageUrl: string | null
  coupleName: string
}

export async function getMyPublicInvite(): Promise<MyPublicInvite> {
  const user = await requireDashboardUser()
  const supabase = createDashboardClient()
  const { data } = await supabase
    .from('couple_profiles')
    .select('partner1_name, partner2_name, public_slug, public_sharing_enabled, cover_image_url')
    .eq('user_id', user.id)
    .maybeSingle<{
      partner1_name: string | null
      partner2_name: string | null
      public_slug: string | null
      public_sharing_enabled: boolean | null
      cover_image_url: string | null
    }>()
  const names = [data?.partner1_name, data?.partner2_name].filter(Boolean)
  return {
    slug: data?.public_slug ?? null,
    enabled: Boolean(data?.public_sharing_enabled),
    coverImageUrl: data?.cover_image_url ?? null,
    coupleName: names.length ? names.join(' & ') : 'The Couple',
  }
}

/**
 * WhatsApp send entitlement = how many invitation "credits" the couple paid for
 * vs how many they've used, SCOPED TO ONE EVENT. Credits are the sum of
 * `guests` across paid invitation_orders assigned to this event; usage is the
 * number of DISTINCT guests already sent a WhatsApp invite FOR THIS EVENT
 * (re-sends don't consume a credit; an invite to a different event is not a
 * re-send). Orders link by user_id or by matching the couple's email/phone
 * (guest checkout allows a null user_id).
 *
 * A couple can have paid orders not yet linked to any event (bought before
 * event-scoping shipped, or a 2+-event couple who hasn't assigned them yet —
 * see `unassignedOrders`). Those never silently count toward any event's
 * quota; the couple must explicitly assign them.
 */
export interface WhatsAppEntitlement {
  purchased: number
  used: number
  remaining: number
  hasPaidOrder: boolean
  /** The paid invitation card's hero image — used as the WhatsApp header. */
  cardImageUrl: string | null
  /** The paid card's tier (e.g. "Signature"), for the "card purchased" badge. */
  cardTier: string | null
  /** The paid card/product name (e.g. "The Couple"). */
  cardName: string | null
  /** Distinct add-ons purchased across paid orders (prints, swag, etc.). */
  addOns: string[]
  /** Couple/honoree display name for the template body ({{2}}). */
  coupleName: string
  /** Swahili event category noun for the template body ({{3}}), e.g. "harusi". */
  eventCategory: string
  /** True once the couple has explicitly confirmed {{2}}/{{3}} — sends are
   *  blocked in the UI until then. */
  sendSettingsConfirmed: boolean
  /** guest_contact_ids already sent a WhatsApp invite for THIS event (re-sends
   *  don't re-charge). */
  alreadySentIds: string[]
  /** Paid orders not yet assigned to any event — the couple needs to pick
   *  which event each one is for before it counts toward that event's quota. */
  unassignedOrders: { id: string; cardName: string | null; cardImageUrl: string | null; purchasedGuests: number }[]
}

interface PaidOrderItem {
  name?: string
  guests?: number
  image?: string
  tier?: string
  addOns?: string[]
}

interface PaidOrderRow {
  id: string
  items: PaidOrderItem[] | null
  paid_at: string
  event_id: string | null
}

/**
 * Every paid order that belongs to this couple. Matches by user_id first;
 * email/phone are ONLY consulted for guest-checkout orders (user_id IS NULL —
 * the buyer wasn't signed in yet) so an order that already carries a
 * DIFFERENT user_id can never be pulled in by a coincidental email/phone
 * match — important now that assignOrderToEvent can WRITE to a matched row,
 * not just read it.
 */
export async function fetchPaidOrdersForCouple(
  supabase: ReturnType<typeof createDashboardClient>,
  userId: string,
  email: string | null | undefined,
  whatsappPhone: string | null,
): Promise<PaidOrderRow[]> {
  const guestCheckoutOrs: string[] = []
  if (email) guestCheckoutOrs.push(`and(user_id.is.null,contact_email.eq.${email})`)
  if (whatsappPhone) guestCheckoutOrs.push(`and(user_id.is.null,contact_phone.eq.${whatsappPhone})`)
  const ors = [`user_id.eq.${userId}`, ...guestCheckoutOrs]

  const { data } = await supabase
    .from('invitation_orders')
    .select('id, items, paid_at, event_id')
    .eq('status', 'paid')
    .or(ors.join(','))
    .order('paid_at', { ascending: false })
  return (data ?? []) as PaidOrderRow[]
}

/** Paid orders not yet attached to any event, shaped for the "assign this
 *  design to an event" prompt. */
function unassignedOrdersFrom(
  orders: PaidOrderRow[],
): { id: string; cardName: string | null; cardImageUrl: string | null; purchasedGuests: number }[] {
  return orders
    .filter((o) => !o.event_id)
    .map((o) => {
      const items = o.items ?? []
      const withImage = items.find((it) => it.image)
      const purchasedGuests = items.reduce(
        (sum, it) => sum + (typeof it.guests === 'number' && it.guests > 0 ? Math.floor(it.guests) : 0),
        0,
      )
      return {
        id: o.id,
        cardName: withImage?.name ?? items[0]?.name ?? null,
        cardImageUrl: withImage?.image ?? null,
        purchasedGuests,
      }
    })
}

export async function getWhatsAppEntitlement(eventId: string): Promise<WhatsAppEntitlement> {
  const user = await requireDashboardUser()
  const supabase = createDashboardClient()

  const { data: profile } = await supabase
    .from('couple_profiles')
    .select('whatsapp_phone, partner1_name, partner2_name, invite_host_name, invite_event_category')
    .eq('user_id', user.id)
    .maybeSingle<{
      whatsapp_phone: string | null
      partner1_name: string | null
      partner2_name: string | null
      invite_host_name: string | null
      invite_event_category: string | null
    }>()
  const coupleNames = [profile?.partner1_name, profile?.partner2_name].filter(Boolean)
  // The couple's explicitly confirmed template values win over derived guesses.
  const hostOverride = profile?.invite_host_name?.trim() || null
  const categoryOverride = profile?.invite_event_category?.trim() || null

  // The SELECTED event, used both for the event-category template variable
  // ({{3}}) and as a coupleName fallback below — not just "the couple's
  // earliest event," now that a couple can be sending for any of several.
  const { data: primaryEvent } = await supabase
    .from('wedding_events')
    .select('name, event_type')
    .eq('user_id', user.id)
    .eq('id', eventId)
    .maybeSingle<{ name: string | null; event_type: string }>()
  const eventCategory = categoryOverride ?? eventTypeLabelSw(primaryEvent?.event_type ?? 'other')

  // No partner names on the profile yet? Fall back to the event's own title
  // (e.g. "Asha & Juma's Wedding") before the generic "The Couple" placeholder.
  const coupleName =
    hostOverride ??
    (coupleNames.length ? coupleNames.join(' & ') : primaryEvent?.name?.trim() || 'The Couple')

  const allPaidOrders = await fetchPaidOrdersForCouple(supabase, user.id, user.email, profile?.whatsapp_phone ?? null)

  const orders = allPaidOrders.filter((o) => o.event_id === eventId) as {
    items: PaidOrderItem[] | null
  }[]

  let purchased = 0
  let cardImageUrl: string | null = null
  let cardTier: string | null = null
  let cardName: string | null = null
  const addOnSet = new Set<string>()
  for (const o of orders) {
    for (const item of o.items ?? []) {
      if (typeof item.guests === 'number' && item.guests > 0) purchased += Math.floor(item.guests)
      // The card they paid for: first hero image/tier/name found (orders are newest-first).
      if (!cardImageUrl && item.image) cardImageUrl = item.image
      if (!cardTier && item.tier) cardTier = item.tier
      if (!cardName && item.name) cardName = item.name
      for (const a of item.addOns ?? []) {
        const label = a.trim()
        if (label) addOnSet.add(label)
      }
    }
  }
  const addOns = [...addOnSet]

  // Paid orders that exist but aren't attached to ANY event yet — surfaced so
  // the couple can assign them instead of them silently counting for nothing.
  const unassignedOrders = unassignedOrdersFrom(allPaidOrders)

  // Used = distinct guests already sent a REAL WhatsApp invite FOR THIS EVENT.
  // Also count sends logged BEFORE event-scoping shipped (event_id IS NULL) —
  // those predate this feature and can't be attributed to a specific event,
  // but treating them as "never sent" would double-invite AND double-charge a
  // guest who was genuinely already invited. Erring toward a free resend is
  // the safer failure mode for a paying customer. Dry-run stub sends log fake
  // wamid.STUB-* ids — they must never consume paid credits.
  const { data: sent } = await supabase
    .from('whatsapp_messages')
    .select('guest_contact_id')
    .eq('user_id', user.id)
    .or(`event_id.eq.${eventId},event_id.is.null`)
    .eq('direction', 'out')
    .eq('kind', 'invite')
    .eq('status', 'sent')
    .not('wamid', 'like', 'wamid.STUB-%')
  const alreadySentIds = [
    ...new Set((sent ?? []).map((r) => r.guest_contact_id as string | null).filter((x): x is string => Boolean(x))),
  ]

  return {
    purchased,
    used: alreadySentIds.length,
    remaining: Math.max(0, purchased - alreadySentIds.length),
    hasPaidOrder: orders.length > 0,
    cardImageUrl,
    cardTier,
    cardName,
    addOns,
    coupleName,
    eventCategory,
    sendSettingsConfirmed: Boolean(hostOverride && categoryOverride),
    alreadySentIds,
    unassignedOrders,
  }
}

// ──────────────────────────── Send-invites page ────────────────────────────

export type SendRowStatus = 'none' | 'sent' | 'viewed' | 'attending' | 'declined' | 'maybe'

export interface SendGuestRow {
  id: string
  name: string
  phone: string | null
  whatsappPhone: string | null
  /** Preferred channel from which number is present. */
  channel: 'whatsapp' | 'sms'
  status: SendRowStatus
  statusLabel: string
  /** Absolute personal RSVP link (for the per-row copy action). */
  rsvpUrl: string
}

export interface SendInvitesData {
  event: {
    coupleName: string
    /** The selected event's own name (e.g. "Boris & Lu") — the heading's display
     *  name. Comes from wedding_events, NOT the profile. Null with no events. */
    eventName: string | null
    /** The selected event's type label (e.g. "Wedding") — the heading suffix. */
    eventTypeLabel: string | null
    /** Swahili event-category noun (e.g. "harusi") — template {{3}}, used by the
     *  in-page WhatsApp preview so it mirrors the real send exactly. */
    eventCategorySw: string
    dateLabel: string | null
    venue: string | null
    cardTier: string | null
    /** The paid card/product name (e.g. "The Couple"). */
    cardName: string | null
    /** The paid card's hero artwork — rendered in the event-context preview. */
    cardImageUrl: string | null
    /** Distinct add-ons purchased across paid orders (prints, swag, etc.). */
    addOns: string[]
    hasPaidOrder: boolean
  }
  /** Every one of the couple's events, for the event switcher. Only worth
   *  rendering a switcher when this has 2+ entries — a single-event couple
   *  never needs to think about "which event." */
  events: { id: string; name: string; eventTypeLabel: string }[]
  /** Which event this data is scoped to. */
  selectedEventId: string | null
  /** Paid orders not yet assigned to any event — show a prompt to assign them
   *  so their design/quota isn't invisible to every event. */
  unassignedOrders: { id: string; cardName: string | null; cardImageUrl: string | null; purchasedGuests: number }[]
  funnel: { invited: number; delivered: number; viewed: number; rsvpd: number }
  quota: { used: number; purchased: number; remaining: number; hasPaidOrder: boolean }
  publicLink: { enabled: boolean; slug: string | null; url: string | null }
  whatsappLive: boolean
  /** The couple's own WhatsApp number — prefills the "send a test" input. */
  testPhone: string | null
  /** Template {{2}}/{{3}} values. `confirmed` is false until the couple has
   *  explicitly saved them — every send path requires that first. */
  sendSettings: { hostName: string; eventCategory: string; confirmed: boolean }
  guests: SendGuestRow[]
}

/**
 * `eventId` scopes everything on this page — the design/quota that's live,
 * which guests count as invited/sent for THIS event, and the event-category
 * template variable. Defaults to the couple's first event (by their own
 * sort order) when not given, so single-event couples never see a switcher
 * and nothing changes for them.
 */
export async function getSendInvitesData(eventId?: string): Promise<SendInvitesData> {
  const user = await requireDashboardUser()
  const supabase = createDashboardClient()
  const origin = publicOrigin()

  const [publicInvite, events, profile, guests] = await Promise.all([
    getMyPublicInvite(),
    getEvents(),
    getCoupleProfile(),
    getGuestsWithInvitations(),
  ])

  const selectedEvent = (eventId && events.find((e) => e.id === eventId)) || events[0] || null
  const selectedEventId = selectedEvent?.id ?? null

  // No events at all yet: nothing to scope guests/quota to, but the couple
  // may already have bought a design before setting up their first event —
  // still surface it so they can create an event and assign it, rather than
  // it silently vanishing.
  if (!selectedEventId) {
    const paidOrders = await fetchPaidOrdersForCouple(
      supabase,
      user.id,
      user.email,
      profile?.whatsapp_phone ?? null,
    )
    return {
      event: {
        coupleName: profile ? coupleDisplayName(profile) : 'The Couple',
        eventName: null,
        eventTypeLabel: null,
        eventCategorySw: 'sherehe',
        dateLabel: null,
        venue: null,
        cardTier: null,
        cardName: null,
        cardImageUrl: null,
        addOns: [],
        hasPaidOrder: false,
      },
      events: [],
      selectedEventId: null,
      unassignedOrders: unassignedOrdersFrom(paidOrders),
      funnel: { invited: 0, delivered: 0, viewed: 0, rsvpd: 0 },
      quota: { used: 0, purchased: 0, remaining: 0, hasPaidOrder: false },
      publicLink: {
        enabled: publicInvite.enabled,
        slug: publicInvite.slug,
        url: publicInvite.slug ? `${origin}/i/${publicInvite.slug}` : null,
      },
      whatsappLive: getWhatsAppProvider().live,
      testPhone: profile?.whatsapp_phone ?? null,
      sendSettings: { hostName: '', eventCategory: '', confirmed: false },
      guests: [],
    }
  }

  const entitlement = await getWhatsAppEntitlement(selectedEventId)

  // WhatsApp read receipts → "viewed" (real once delivery webhooks land),
  // scoped to this event only.
  const { data: readRows } = await supabase
    .from('whatsapp_messages')
    .select('guest_contact_id')
    .eq('user_id', user.id)
    .eq('event_id', selectedEventId)
    .eq('direction', 'out')
    .eq('status', 'read')
  const readSet = new Set(
    (readRows ?? []).map((r) => r.guest_contact_id as string | null).filter((x): x is string => Boolean(x)),
  )
  const sentSet = new Set(entitlement.alreadySentIds)

  const roster = guests.filter((g) => g.review_status !== 'unconfirmed')

  const rows: SendGuestRow[] = roster.map((g) => {
    // Scope this guest's invitations to the SELECTED event only — a guest
    // attending the Sendoff must not show as "Attending" on the Wedding's
    // Send Invites page.
    const invs = g.invitations.filter((i) => i.event_id === selectedEventId)
    const attending = invs.find((i) => i.rsvp_status === 'attending')
    const anyDeclined = invs.length > 0 && invs.every((i) => i.rsvp_status === 'declined')
    const anyMaybe = invs.some((i) => i.rsvp_status === 'maybe')
    const wasSent = sentSet.has(g.id)
    const wasRead = readSet.has(g.id)

    let status: SendRowStatus = 'none'
    let statusLabel = 'Not sent'
    if (attending) {
      status = 'attending'
      statusLabel = attending.party_size > 1 ? `Attending · ${attending.party_size}` : 'Attending'
    } else if (anyDeclined) {
      status = 'declined'
      statusLabel = 'Declined'
    } else if (anyMaybe) {
      status = 'maybe'
      statusLabel = 'Maybe'
    } else if (wasRead) {
      status = 'viewed'
      statusLabel = 'Viewed'
    } else if (wasSent) {
      status = 'sent'
      statusLabel = 'Sent'
    }

    return {
      id: g.id,
      name: g.full_name,
      phone: g.phone,
      whatsappPhone: g.whatsapp_phone,
      channel: g.whatsapp_phone ? 'whatsapp' : 'sms',
      status,
      statusLabel,
      rsvpUrl: `${origin}/rsvp/${g.public_token}`,
    }
  })

  const funnel = {
    invited: roster.length,
    delivered: rows.filter((r) => r.status !== 'none').length,
    viewed: rows.filter((r) => r.status === 'viewed' || r.status === 'attending' || r.status === 'declined' || r.status === 'maybe').length,
    rsvpd: roster.filter((g) => g.invitations.some((i) => i.event_id === selectedEventId && i.responded_at)).length,
  }

  const eventName = selectedEvent.name?.trim() || null
  const eventTypeLbl = eventTypeLabel(selectedEvent.event_type)
  const venue = [selectedEvent.venue_name, selectedEvent.city].filter(Boolean).join(', ') || null

  return {
    event: {
      coupleName: entitlement.coupleName,
      eventName,
      eventTypeLabel: eventTypeLbl,
      eventCategorySw: entitlement.eventCategory,
      dateLabel: formatLongDate(selectedEvent.starts_at) || null,
      venue,
      cardTier: entitlement.cardTier,
      cardName: entitlement.cardName,
      cardImageUrl: entitlement.cardImageUrl,
      addOns: entitlement.addOns,
      hasPaidOrder: entitlement.hasPaidOrder,
    },
    events: events.map((e) => ({ id: e.id, name: e.name, eventTypeLabel: eventTypeLabel(e.event_type) })),
    selectedEventId,
    unassignedOrders: entitlement.unassignedOrders,
    funnel,
    quota: {
      used: entitlement.used,
      purchased: entitlement.purchased,
      remaining: entitlement.remaining,
      hasPaidOrder: entitlement.hasPaidOrder,
    },
    publicLink: {
      enabled: publicInvite.enabled,
      slug: publicInvite.slug,
      url: publicInvite.slug ? `${origin}/i/${publicInvite.slug}` : null,
    },
    whatsappLive: getWhatsAppProvider().live,
    testPhone: profile?.whatsapp_phone ?? null,
    sendSettings: {
      hostName: entitlement.coupleName,
      eventCategory: entitlement.eventCategory,
      confirmed: entitlement.sendSettingsConfirmed,
    },
    guests: rows,
  }
}

/** Guests that self-registered via the public link and await host review. */
export async function getGuestsAwaitingReview(): Promise<GuestWithInvitations[]> {
  const user = await requireDashboardUser()
  const supabase = createDashboardClient()
  const { data: guests, error } = await supabase
    .from('guest_contacts')
    .select('*')
    .eq('user_id', user.id)
    .eq('review_status', 'unconfirmed')
    .order('created_at', { ascending: false })
  if (error) throw new Error(error.message)
  const ids = (guests ?? []).map((g) => g.id as string)
  if (ids.length === 0) return []

  const { data: invitations } = await supabase
    .from('guest_invitations')
    .select('*')
    .in('guest_contact_id', ids)

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

