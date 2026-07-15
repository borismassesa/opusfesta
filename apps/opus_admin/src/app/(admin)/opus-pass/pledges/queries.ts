import 'server-only'
import { createSupabaseAdminClient } from '@/lib/supabase'
import { listEligibleCoupleTiers, type PledgeConciergeTier } from './tier'
import { toTzs } from './currency'

export interface EligibleCouple {
  userId: string
  tier: PledgeConciergeTier
  coupleName: string
  eventDateLabel: string | null
  pledgeCount: number
  totalPledged: number
  totalReceived: number
  outstandingCount: number
  lastActivityAt: string | null
}

type ProfileRow = { user_id: string; partner1_name: string | null; partner2_name: string | null }
type EventRow = { user_id: string; name: string | null; starts_at: string | null }
type PledgeAggRow = {
  user_id: string
  pledged_amount: number
  amount_received: number
  currency: string
  status: string
  created_at: string
  updated_at: string
}

/** Staff-facing eligibility list: every couple with a paid Elegant/Signature
 *  order, joined with a couple-name display and their pledge campaign stats.
 *  Reads via the service-role client with no owner filter (mirrors the
 *  finance/payments precedent) — this is a cross-couple admin surface. */
export async function getEligibleCouples(): Promise<EligibleCouple[]> {
  const tiers = await listEligibleCoupleTiers()
  const userIds = [...tiers.keys()]
  if (!userIds.length) return []

  const supabase = createSupabaseAdminClient()
  const [{ data: profiles, error: profilesErr }, { data: events, error: eventsErr }, { data: pledges, error: pledgesErr }] =
    await Promise.all([
      supabase.from('couple_profiles').select('user_id, partner1_name, partner2_name').in('user_id', userIds),
      supabase
        .from('wedding_events')
        .select('user_id, name, starts_at')
        .in('user_id', userIds)
        .order('sort_order', { ascending: true })
        .order('starts_at', { ascending: true, nullsFirst: false }),
      supabase
        .from('event_pledges')
        .select('user_id, pledged_amount, amount_received, currency, status, created_at, updated_at')
        .in('user_id', userIds),
    ])
  if (profilesErr) throw new Error(profilesErr.message)
  if (eventsErr) throw new Error(eventsErr.message)
  if (pledgesErr) throw new Error(pledgesErr.message)

  const profileByUser = new Map<string, ProfileRow>()
  for (const p of (profiles ?? []) as ProfileRow[]) profileByUser.set(p.user_id, p)

  // First event per couple (already ordered), for a display date.
  const firstEventByUser = new Map<string, EventRow>()
  for (const e of (events ?? []) as EventRow[]) {
    if (!firstEventByUser.has(e.user_id)) firstEventByUser.set(e.user_id, e)
  }

  const statsByUser = new Map<
    string,
    { count: number; pledged: number; received: number; outstanding: number; lastActivity: string | null }
  >()
  for (const row of (pledges ?? []) as PledgeAggRow[]) {
    const bucket = statsByUser.get(row.user_id) ?? {
      count: 0,
      pledged: 0,
      received: 0,
      outstanding: 0,
      lastActivity: null,
    }
    bucket.count += 1
    bucket.pledged += toTzs(Number(row.pledged_amount) || 0, row.currency)
    bucket.received += toTzs(Number(row.amount_received) || 0, row.currency)
    if (row.status !== 'paid' && row.status !== 'declined') bucket.outstanding += 1
    const activityAt = row.updated_at || row.created_at
    if (activityAt && (!bucket.lastActivity || activityAt > bucket.lastActivity)) bucket.lastActivity = activityAt
    statsByUser.set(row.user_id, bucket)
  }

  return userIds
    .map((userId): EligibleCouple => {
      const profile = profileByUser.get(userId)
      const event = firstEventByUser.get(userId)
      const coupleName =
        [profile?.partner1_name, profile?.partner2_name].filter(Boolean).join(' & ') || event?.name?.trim() || 'The Couple'
      const stats = statsByUser.get(userId)
      return {
        userId,
        tier: tiers.get(userId)!,
        coupleName,
        eventDateLabel: event?.starts_at ?? null,
        pledgeCount: stats?.count ?? 0,
        totalPledged: stats?.pledged ?? 0,
        totalReceived: stats?.received ?? 0,
        outstandingCount: stats?.outstanding ?? 0,
        lastActivityAt: stats?.lastActivity ?? null,
      }
    })
    .sort((a, b) => a.coupleName.localeCompare(b.coupleName))
}
