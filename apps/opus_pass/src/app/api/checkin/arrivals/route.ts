import { NextResponse } from 'next/server'
import { getDashboardUser } from '@/lib/dashboard/auth'
import { ownedEventIds } from '@/lib/dashboard/queries'
import { createSupabaseServerClient } from '@/lib/supabase'

export const dynamic = 'force-dynamic'

/**
 * Recent arrivals + live checked-in count for the couple's Check-ins tab.
 *
 * Replaces a former anon Realtime Broadcast subscription that was world-
 * readable: because the channel (checkin:<eventId>) was a plain public
 * broadcast and eventId appears in guest-facing share links, anyone holding
 * the public anon key who knew an eventId could subscribe and watch a
 * stranger's guest list check in, live, with names and party sizes.
 *
 * This endpoint is polled instead, and is gated on the same ownership check
 * the rest of the dashboard uses (ownedEventIds), so only the event's owning
 * couple can read its arrivals. The roster below the feed remains the source
 * of truth; this just feeds the "just arrived" strip and nudges the roster to
 * refresh when the headcount changes.
 */
export async function GET(request: Request) {
  const eventId = new URL(request.url).searchParams.get('event')
  if (!eventId) {
    return NextResponse.json({ error: 'Missing event' }, { status: 400 })
  }

  const user = await getDashboardUser()
  if (!user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  // Ownership gate: only the couple who owns this event may read its arrivals.
  // A 404 (rather than 403) keeps the endpoint from confirming an eventId
  // exists to someone who doesn't own it.
  const [owned] = await ownedEventIds(user.id, [eventId])
  if (!owned) {
    return NextResponse.json({ error: 'Not found' }, { status: 404 })
  }

  const supabase = createSupabaseServerClient()

  const { data, error } = await supabase
    .from('guest_invitations')
    .select('checked_in_at, checked_in_door, checked_in_party_size, party_size, guest_contacts(full_name)')
    .eq('event_id', eventId)
    .eq('rsvp_status', 'attending')
    .not('checked_in_at', 'is', null)
    .order('checked_in_at', { ascending: false })
    .limit(8)
    .returns<
      {
        checked_in_at: string
        checked_in_door: string | null
        checked_in_party_size: number | null
        party_size: number | null
        guest_contacts: { full_name: string } | null
      }[]
    >()

  if (error) {
    return NextResponse.json({ error: 'Failed to load arrivals' }, { status: 500 })
  }

  const arrivals = (data ?? []).map((r) => ({
    name: r.guest_contacts?.full_name ?? 'Guest',
    door: r.checked_in_door ?? 'Main Gate',
    at: r.checked_in_at,
    partySize: r.checked_in_party_size ?? r.party_size ?? 1,
  }))

  // Total arrived is a separate count query — the feed above is capped at 8,
  // so its length can't stand in for the headcount once more than 8 are in.
  const { count } = await supabase
    .from('guest_invitations')
    .select('id', { count: 'exact', head: true })
    .eq('event_id', eventId)
    .eq('rsvp_status', 'attending')
    .not('checked_in_at', 'is', null)

  return NextResponse.json({ arrivals, arrivedCount: count ?? arrivals.length })
}
