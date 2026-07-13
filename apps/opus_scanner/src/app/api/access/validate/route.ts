import { NextResponse } from 'next/server'
import { createScannerClient } from '@/lib/supabase'
import { hashScannerAccessToken, signEntryPassToken } from '@/lib/checkin'

export interface RosterEntry {
  qrToken: string
  invitationId: string
  guestContactId: string
  fullName: string
  partySize: number
  checkedInAt: string | null
  /** The real guest-list grouping the couple entered when building their
   * list — e.g. "Bride's Family", "University Friends" — free text, not an
   * enum. This is what actually exists in guest_contacts.group_tag. */
  groupTag: string | null
  /** Heuristic only: true when the couple literally wrote "VIP" somewhere
   * in the group tag. There's no dedicated VIP/General tier system in
   * OpusPass's guest data model — group_tag is the real field. */
  isVip: boolean
}

/**
 * Validates a door-staff bearer token for one event. Called once at staff
 * login (see /event/[eventId]) and again whenever the client wants to
 * re-confirm the session is still active (e.g. after coming back online).
 */
export async function POST(request: Request) {
  const { eventId, token } = (await request.json().catch(() => ({}))) as {
    eventId?: string
    token?: string
  }
  if (!eventId || !token) {
    return NextResponse.json({ ok: false, error: 'Missing eventId or token' }, { status: 400 })
  }

  const supabase = createScannerClient()
  const tokenHash = hashScannerAccessToken(token)

  const { data: row, error } = await supabase
    .from('scanner_access_tokens')
    .select('id, door_label, event_id, expires_at, revoked_at, attendant_name')
    .eq('token_hash', tokenHash)
    .eq('event_id', eventId)
    .maybeSingle()

  if (error) return NextResponse.json({ ok: false, error: 'Lookup failed' }, { status: 500 })
  if (!row) return NextResponse.json({ ok: false, error: 'Invalid link' }, { status: 401 })
  if (row.revoked_at) return NextResponse.json({ ok: false, error: 'This link has been revoked' }, { status: 401 })
  if (new Date(row.expires_at).getTime() < Date.now()) {
    return NextResponse.json({ ok: false, error: 'This link has expired' }, { status: 401 })
  }

  await supabase
    .from('scanner_access_tokens')
    .update({ last_used_at: new Date().toISOString() })
    .eq('id', row.id)

  const { data: event } = await supabase
    .from('wedding_events')
    .select('id, name, event_type')
    .eq('id', eventId)
    .maybeSingle()

  // Guest-list snapshot for offline scanning: every guest attending this
  // event, with their entry-pass token recomputed server-side (it's
  // deterministic — see lib/checkin.ts). The scanner caches this in
  // IndexedDB so a scan still resolves when the venue has no signal.
  const { data: invitations } = await supabase
    .from('guest_invitations')
    .select('id, guest_contact_id, party_size, checked_in_at, rsvp_status, guest_contacts(full_name, group_tag)')
    .eq('event_id', eventId)
    .eq('rsvp_status', 'attending')

  const roster: RosterEntry[] = (invitations ?? []).map((inv) => {
    const contact = inv.guest_contacts as unknown as { full_name: string; group_tag: string | null } | null
    return {
      qrToken: signEntryPassToken({ invitationId: inv.id, guestContactId: inv.guest_contact_id }),
      invitationId: inv.id,
      guestContactId: inv.guest_contact_id,
      fullName: contact?.full_name ?? 'Guest',
      partySize: inv.party_size,
      checkedInAt: inv.checked_in_at,
      groupTag: contact?.group_tag ?? null,
      isVip: /vip/i.test(contact?.group_tag ?? ''),
    }
  })

  return NextResponse.json({
    ok: true,
    doorLabel: row.door_label,
    // Non-null when an admin assigned this code to a named attendant at
    // issuance — authoritative, EventLogin must skip the name-entry step.
    attendantName: row.attendant_name,
    event,
    roster,
  })
}
