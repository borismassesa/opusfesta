import { NextResponse } from 'next/server'
import { createScannerClient } from '@/lib/supabase'
import { hashScannerAccessToken, verifyEntryPassToken } from '@/lib/checkin'
import { broadcastCheckin } from '@/lib/broadcast'

interface CheckinBody {
  eventId?: string
  accessToken?: string
  doorLabel?: string
  qrToken?: string
  /** Which attendant is holding this device this shift — set via the EventLogin name step. */
  attendantName?: string
  /** Set when this check-in came from the manual guest-search flow, not a camera scan (lost phone, etc). */
  manualReason?: string
}

/**
 * Scans a guest's entry-pass QR and checks them in, or reports why not.
 * Two independent tokens are involved and both are verified server-side:
 *  - accessToken: proves this device is allowed to scan for this event
 *  - qrToken: proves this QR is a genuine, unmodified entry pass
 */
export async function POST(request: Request) {
  const { eventId, accessToken, doorLabel, qrToken, attendantName, manualReason } = (await request
    .json()
    .catch(() => ({}))) as CheckinBody
  if (!eventId || !accessToken || !qrToken) {
    return NextResponse.json({ status: 'error', message: 'Malformed request' }, { status: 400 })
  }

  const supabase = createScannerClient()

  const { data: access } = await supabase
    .from('scanner_access_tokens')
    .select('id, revoked_at, expires_at, attendant_name')
    .eq('token_hash', hashScannerAccessToken(accessToken))
    .eq('event_id', eventId)
    .maybeSingle()
  if (!access || access.revoked_at || new Date(access.expires_at).getTime() < Date.now()) {
    return NextResponse.json({ status: 'error', message: 'Scanner session expired — log in again' }, { status: 401 })
  }
  // An admin-assigned code carries its own authoritative name — the device
  // holder cannot override it via the request body (that field only
  // matters for couple self-serve tokens where the attendant types it in).
  const effectiveAttendantName = access.attendant_name || attendantName

  const payload = verifyEntryPassToken(qrToken)
  if (!payload) {
    return NextResponse.json({ status: 'invalid', message: 'Not a valid entry pass' })
  }

  // The invitation must belong to this scanner's event and still be an
  // active "attending" RSVP — a guest for a different event/couple must
  // never validate at this door, and a guest the couple later moved off
  // "attending" (declined, or corrected a mistaken invite) has their pass
  // implicitly revoked without needing a separate revocation flag/table.
  const { data: invitation } = await supabase
    .from('guest_invitations')
    .select('id, event_id, guest_contact_id, party_size, checked_in_at, rsvp_status')
    .eq('id', payload.invitationId)
    .eq('guest_contact_id', payload.guestContactId)
    .maybeSingle()
  if (!invitation || invitation.event_id !== eventId) {
    return NextResponse.json({ status: 'invalid', message: 'This pass is not for this event' })
  }
  if (invitation.rsvp_status !== 'attending') {
    return NextResponse.json({ status: 'invalid', message: 'This guest is no longer marked as attending' })
  }

  const { data: guest } = await supabase
    .from('guest_contacts')
    .select('full_name, group_tag')
    .eq('id', payload.guestContactId)
    .maybeSingle()

  const guestName = guest?.full_name ?? 'Guest'
  const groupTag = guest?.group_tag ?? null
  const isVip = /vip/i.test(groupTag ?? '')
  const displayDoor = doorLabel || 'Main Gate'
  // The audit trail (checked_in_by) records who was actually holding the
  // device, not just the door — the broadcast/UI door label stays plain so
  // it reads cleanly in the live activity feed.
  const auditLabel = [effectiveAttendantName || 'Unknown attendant', `(${displayDoor})`, manualReason ? `(manual: ${manualReason})` : null]
    .filter(Boolean)
    .join(' ')

  if (invitation.checked_in_at) {
    await broadcastCheckin(eventId, {
      status: 'duplicate',
      guestName,
      partySize: invitation.party_size,
      doorLabel: displayDoor,
      at: invitation.checked_in_at,
    })
    return NextResponse.json({
      status: 'duplicate',
      guestName,
      partySize: invitation.party_size,
      checkedInAt: invitation.checked_in_at,
      isVip,
      groupTag,
    })
  }

  const { data: updated, error } = await supabase.rpc('checkin_guest_invitation', {
    p_guest_invitation_id: payload.invitationId,
    p_checked_in_by: auditLabel,
    p_checked_in_door: displayDoor,
  })
  if (error) return NextResponse.json({ status: 'error', message: 'Check-in failed' }, { status: 500 })

  // RPC returns an all-null row (not an error) if another scan won the race
  // between our lookup above and the atomic UPDATE.
  if (!updated || !updated.checked_in_at) {
    await broadcastCheckin(eventId, {
      status: 'duplicate',
      guestName,
      partySize: invitation.party_size,
      doorLabel: displayDoor,
      at: new Date().toISOString(),
    })
    return NextResponse.json({
      status: 'duplicate',
      guestName,
      partySize: invitation.party_size,
      checkedInAt: null,
      isVip,
      groupTag,
    })
  }

  await broadcastCheckin(eventId, {
    status: 'success',
    guestName,
    partySize: invitation.party_size,
    doorLabel: displayDoor,
    at: updated.checked_in_at,
  })

  return NextResponse.json({
    status: 'success',
    guestName,
    partySize: invitation.party_size,
    isVip,
    groupTag,
  })
}
