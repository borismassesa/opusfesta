import { createSupabaseAdminClient } from '@/lib/supabase'
import { hasAnyPermission, hasPermission, requirePermission } from '@/lib/admin-auth'
import { listAttendants } from '../actions'
import EventConsoleClient from './EventConsoleClient'
import type { CheckinBaseline } from './CheckinEventClient'

export const dynamic = 'force-dynamic'

export default async function CheckinEventPage({
  params,
  searchParams,
}: {
  params: Promise<{ eventId: string }>
  searchParams: Promise<{ tab?: string }>
}) {
  const { eventId } = await params
  const { tab } = await searchParams
  const initialTab = tab === 'tickets' ? 'tickets' : 'checkin'

  // Either permission gets you into the shared console — the tab you land
  // on is the one you're allowed to use; each tab's own server actions
  // still enforce their specific permission (opuspass.checkin vs
  // opuspass.tickets) independently.
  if (!(await hasAnyPermission(['opuspass.checkin', 'opuspass.tickets']))) {
    await requirePermission(initialTab === 'tickets' ? 'opuspass.tickets' : 'opuspass.checkin')
  }
  const admin = createSupabaseAdminClient()

  const { data: event } = await admin
    .from('wedding_events')
    .select('id, name, event_type, starts_at, user_id')
    .eq('id', eventId)
    .maybeSingle<{ id: string; name: string; event_type: string; starts_at: string | null; user_id: string }>()

  let coupleName: string | null = null
  if (event) {
    const { data: owner } = await admin
      .from('users')
      .select('name, email')
      .eq('id', event.user_id)
      .maybeSingle<{ name: string | null; email: string | null }>()
    coupleName = owner?.name ?? owner?.email ?? null
  }

  // Baseline snapshot — admin needs cross-couple visibility, so this reads
  // via the service-role client with no owner filter (unlike opus_pass's
  // getEventCheckinSummary, which is scoped to requireDashboardUser()'s
  // user_id). The Realtime Broadcast feed layered on top in
  // CheckinEventClient is identical to the couple's own LiveAttendance.
  const { data: invitations } = await admin
    .from('guest_invitations')
    .select('guest_contact_id, checked_in_at, checked_in_door')
    .eq('event_id', eventId)
    .eq('rsvp_status', 'attending')

  const rows = (invitations ?? []) as {
    guest_contact_id: string
    checked_in_at: string | null
    checked_in_door: string | null
  }[]
  const checkedIn = rows.filter((r) => r.checked_in_at)

  const guestIds = checkedIn.map((r) => r.guest_contact_id)
  const nameById = new Map<string, string>()
  if (guestIds.length > 0) {
    const { data: contacts } = await admin.from('guest_contacts').select('id, full_name').in('id', guestIds)
    for (const c of (contacts ?? []) as { id: string; full_name: string }[]) nameById.set(c.id, c.full_name)
  }

  const recent = checkedIn
    .sort((a, b) => new Date(b.checked_in_at!).getTime() - new Date(a.checked_in_at!).getTime())
    .slice(0, 8)
    .map((r) => ({
      guestName: nameById.get(r.guest_contact_id) ?? 'Guest',
      doorLabel: r.checked_in_door,
      checkedInAt: r.checked_in_at!,
    }))

  const baseline: CheckinBaseline = {
    event: event
      ? { id: event.id, name: event.name, eventType: event.event_type, startsAt: event.starts_at, coupleName }
      : null,
    totalAttending: rows.length,
    totalCheckedIn: checkedIn.length,
    recent,
  }

  const canCheckin = await hasPermission('opuspass.checkin')
  const canTickets = await hasPermission('opuspass.tickets')

  // A ticket-only caller (no opuspass.checkin) can still land here to use
  // the tickets tab — listAttendants would throw for them, so skip it
  // rather than crash the whole page over a tab they're not viewing.
  const attendants = canCheckin ? await listAttendants(eventId) : []

  // Land on whichever tab the caller actually has, if their requested one
  // isn't available to them.
  const resolvedTab = initialTab === 'tickets' ? (canTickets ? 'tickets' : 'checkin') : canCheckin ? 'checkin' : 'tickets'

  return (
    <EventConsoleClient
      eventId={eventId}
      baseline={baseline}
      initialAttendants={attendants}
      initialTab={resolvedTab}
      canCheckin={canCheckin}
      canTickets={canTickets}
    />
  )
}
