import 'server-only'
import { createSupabaseAdminClient } from '@/lib/supabase'

// Cross-couple staff surface: reads go through the service-role client with no
// owner filter, mirroring the finance/payments and pledge-concierge precedent.
//
// Per-couple counts come from the couple_account_stats view (migration
// 20260722000002) rather than being aggregated here. PostgREST caps every
// response at 1000 rows, and guest_invitations is already past that, so
// counting in the app would silently undercount.

export type CoupleAccountStatus = 'dormant' | 'active' | 'paying'

export interface CoupleAccountRow {
  userId: string
  coupleName: string
  email: string | null
  phone: string | null
  avatarUrl: string | null
  /** Has a Clerk identity, i.e. can actually sign in. */
  clerkLinked: boolean
  signedUpAt: string
  /** Has a couple_profiles row, i.e. finished the onboarding wizard. */
  onboarded: boolean
  weddingDate: string | null
  city: string | null
  eventCount: number
  guestCount: number
  invitationCount: number
  rsvpAttending: number
  rsvpPending: number
  orderCount: number
  paidOrderCount: number
  lifetimeSpendTzs: number
  pledgeCount: number
  registryItemCount: number
  guestbookCount: number
  lastActivityAt: string | null
  status: CoupleAccountStatus
}

type UserRow = {
  id: string
  name: string | null
  email: string | null
  phone: string | null
  avatar: string | null
  clerk_id: string | null
  created_at: string
}

type ProfileRow = {
  user_id: string
  partner1_name: string | null
  partner2_name: string | null
  wedding_date: string | null
  city: string | null
  avatar_url: string | null
}

type EventRow = { user_id: string; name: string | null; starts_at: string | null }

type StatsRow = {
  user_id: string
  event_count: number
  guest_count: number
  invitation_count: number
  rsvp_attending: number
  rsvp_pending: number
  order_count: number
  paid_order_count: number
  lifetime_spend_tzs: number | string
  pledge_count: number
  registry_item_count: number
  guestbook_count: number
  last_activity_at: string | null
}

const EMPTY_STATS: Omit<StatsRow, 'user_id'> = {
  event_count: 0,
  guest_count: 0,
  invitation_count: 0,
  rsvp_attending: 0,
  rsvp_pending: 0,
  order_count: 0,
  paid_order_count: 0,
  lifetime_spend_tzs: 0,
  pledge_count: 0,
  registry_item_count: 0,
  guestbook_count: 0,
  last_activity_at: null,
}

/** Same fallback chain as getEligibleCouples in ../pledges/queries.ts, plus
 *  the account's own name/email so dormant signups (who have no profile and
 *  no event) still render as something a human recognises. */
function resolveCoupleName(profile: ProfileRow | undefined, event: EventRow | undefined, user: UserRow): string {
  const fromProfile = [profile?.partner1_name, profile?.partner2_name].filter(Boolean).join(' & ')
  if (fromProfile) return fromProfile
  const fromEvent = event?.name?.trim()
  if (fromEvent) return fromEvent
  const fromAccount = user.name?.trim()
  if (fromAccount) return fromAccount
  const localPart = user.email?.split('@')[0]?.trim()
  return localPart || 'Unnamed account'
}

/** Every OpusFesta account with role='user' — the couple side of the platform.
 *  Dormant signups are included on purpose: knowing how many people made an
 *  account and then did nothing is the whole point of this list. */
export async function getCoupleAccounts(): Promise<CoupleAccountRow[]> {
  const supabase = createSupabaseAdminClient()

  const [{ data: users, error: usersErr }, { data: profiles, error: profilesErr }, { data: events, error: eventsErr }, { data: stats, error: statsErr }] =
    await Promise.all([
      supabase
        .from('users')
        .select('id, name, email, phone, avatar, clerk_id, created_at')
        .eq('role', 'user')
        .order('created_at', { ascending: false })
        .returns<UserRow[]>(),
      supabase
        .from('couple_profiles')
        .select('user_id, partner1_name, partner2_name, wedding_date, city, avatar_url')
        .returns<ProfileRow[]>(),
      supabase
        .from('wedding_events')
        .select('user_id, name, starts_at')
        .order('sort_order', { ascending: true })
        .order('starts_at', { ascending: true, nullsFirst: false })
        .returns<EventRow[]>(),
      supabase.from('couple_account_stats').select('*').returns<StatsRow[]>(),
    ])
  if (usersErr) throw new Error(usersErr.message)
  if (profilesErr) throw new Error(profilesErr.message)
  if (eventsErr) throw new Error(eventsErr.message)
  if (statsErr) throw new Error(statsErr.message)

  const profileByUser = new Map((profiles ?? []).map((p) => [p.user_id, p]))
  const statsByUser = new Map((stats ?? []).map((s) => [s.user_id, s]))

  // Events arrive pre-ordered, so the first one seen per couple is their
  // primary event — used for the name fallback and the displayed date.
  const firstEventByUser = new Map<string, EventRow>()
  for (const e of events ?? []) {
    if (!firstEventByUser.has(e.user_id)) firstEventByUser.set(e.user_id, e)
  }

  return (users ?? []).map((user): CoupleAccountRow => {
    const profile = profileByUser.get(user.id)
    const event = firstEventByUser.get(user.id)
    const s = statsByUser.get(user.id) ?? EMPTY_STATS
    const lifetimeSpendTzs = Number(s.lifetime_spend_tzs) || 0

    const hasActivity =
      Boolean(profile) ||
      s.event_count > 0 ||
      s.guest_count > 0 ||
      s.order_count > 0 ||
      s.pledge_count > 0 ||
      s.registry_item_count > 0 ||
      s.guestbook_count > 0

    return {
      userId: user.id,
      coupleName: resolveCoupleName(profile, event, user),
      email: user.email,
      phone: user.phone,
      avatarUrl: profile?.avatar_url ?? user.avatar,
      clerkLinked: Boolean(user.clerk_id),
      signedUpAt: user.created_at,
      onboarded: Boolean(profile),
      weddingDate: profile?.wedding_date ?? event?.starts_at ?? null,
      city: profile?.city ?? null,
      eventCount: s.event_count,
      guestCount: s.guest_count,
      invitationCount: s.invitation_count,
      rsvpAttending: s.rsvp_attending,
      rsvpPending: s.rsvp_pending,
      orderCount: s.order_count,
      paidOrderCount: s.paid_order_count,
      lifetimeSpendTzs,
      pledgeCount: s.pledge_count,
      registryItemCount: s.registry_item_count,
      guestbookCount: s.guestbook_count,
      lastActivityAt: s.last_activity_at,
      status: s.paid_order_count > 0 ? 'paying' : hasActivity ? 'active' : 'dormant',
    }
  })
}

export interface UnlinkedOrder {
  orderId: string
  ref: string
  status: string
  contactName: string | null
  contactEmail: string
  amountTotal: number
  currency: string
  createdAt: string
  /** The account whose email matches, if any — the link action's target. */
  matchedUserId: string | null
  matchedCoupleName: string | null
}

type OrphanOrderRow = {
  id: string
  ref: string
  status: string
  contact_name: string | null
  contact_email: string | null
  amount_total: number | string | null
  currency: string | null
  created_at: string
}

/**
 * Orders that were paid for but never attached to an account. Checkout can
 * complete without a signed-in user, so `invitation_orders.user_id` stays
 * NULL — which hides that revenue from the couple's own dashboard AND from
 * getEligibleCouples in ../pledges/queries.ts (it filters user_id NOT NULL),
 * so those couples silently never reach Pledge Concierge either.
 *
 * Matching is on contact_email, case-insensitively. Orders with no matching
 * account are still returned so staff can see them; they just have no link
 * target until that person signs up.
 */
export async function getUnlinkedOrders(): Promise<UnlinkedOrder[]> {
  const supabase = createSupabaseAdminClient()

  const [{ data: orders, error: ordersErr }, { data: users, error: usersErr }, { data: profiles, error: profilesErr }] =
    await Promise.all([
      supabase
        .from('invitation_orders')
        .select('id, ref, status, contact_name, contact_email, amount_total, currency, created_at')
        .is('user_id', null)
        .order('created_at', { ascending: false })
        .returns<OrphanOrderRow[]>(),
      supabase.from('users').select('id, name, email').eq('role', 'user').returns<Pick<UserRow, 'id' | 'name' | 'email'>[]>(),
      supabase.from('couple_profiles').select('user_id, partner1_name, partner2_name').returns<ProfileRow[]>(),
    ])
  if (ordersErr) throw new Error(ordersErr.message)
  if (usersErr) throw new Error(usersErr.message)
  if (profilesErr) throw new Error(profilesErr.message)

  const profileByUser = new Map((profiles ?? []).map((p) => [p.user_id, p]))
  const userByEmail = new Map<string, Pick<UserRow, 'id' | 'name' | 'email'>>()
  for (const u of users ?? []) {
    if (u.email) userByEmail.set(u.email.toLowerCase(), u)
  }

  return (orders ?? []).map((order): UnlinkedOrder => {
    const match = order.contact_email ? userByEmail.get(order.contact_email.toLowerCase()) : undefined
    const profile = match ? profileByUser.get(match.id) : undefined
    const matchedName = match
      ? [profile?.partner1_name, profile?.partner2_name].filter(Boolean).join(' & ') ||
        match.name?.trim() ||
        match.email ||
        'Unnamed account'
      : null

    return {
      orderId: order.id,
      ref: order.ref,
      status: order.status,
      contactName: order.contact_name,
      contactEmail: order.contact_email ?? '',
      amountTotal: Number(order.amount_total) || 0,
      currency: order.currency ?? 'TZS',
      createdAt: order.created_at,
      matchedUserId: match?.id ?? null,
      matchedCoupleName: matchedName,
    }
  })
}
