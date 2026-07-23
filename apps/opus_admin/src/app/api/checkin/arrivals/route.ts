import { NextResponse } from 'next/server'
import { createSupabaseAdminClient } from '@/lib/supabase'
import { hasPermission } from '@/lib/admin-auth'

export const dynamic = 'force-dynamic'

/**
 * Recent arrivals + live checked-in count for the admin check-in console.
 *
 * Replaces a former anon Realtime Broadcast subscription that was world-
 * readable (see apps/opus_pass/src/app/api/checkin/arrivals/route.ts for the
 * full write-up). Admin has cross-couple visibility by design, so this reads
 * via the service-role client with no owner filter — but it is gated on the
 * opuspass.checkin permission, exactly like the console page itself, so only
 * authorized staff can read any event's arrivals.
 */
export async function GET(request: Request) {
  if (!(await hasPermission('opuspass.checkin'))) {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
  }

  const eventId = new URL(request.url).searchParams.get('event')
  if (!eventId) {
    return NextResponse.json({ error: 'Missing event' }, { status: 400 })
  }

  const admin = createSupabaseAdminClient()

  const { data, error } = await admin
    .from('guest_invitations')
    .select('checked_in_at, checked_in_door, guest_contacts(full_name)')
    .eq('event_id', eventId)
    .eq('rsvp_status', 'attending')
    .not('checked_in_at', 'is', null)
    .order('checked_in_at', { ascending: false })
    .limit(20)
    .returns<
      { checked_in_at: string; checked_in_door: string | null; guest_contacts: { full_name: string } | null }[]
    >()

  if (error) {
    return NextResponse.json({ error: 'Failed to load arrivals' }, { status: 500 })
  }

  const arrivals = (data ?? []).map((r) => ({
    guestName: r.guest_contacts?.full_name ?? 'Guest',
    doorLabel: r.checked_in_door,
    checkedInAt: r.checked_in_at,
  }))

  // Total arrived is a separate count — the feed above is capped at 20.
  const { count } = await admin
    .from('guest_invitations')
    .select('id', { count: 'exact', head: true })
    .eq('event_id', eventId)
    .eq('rsvp_status', 'attending')
    .not('checked_in_at', 'is', null)

  return NextResponse.json({ arrivals, totalCheckedIn: count ?? arrivals.length })
}
