import { NextResponse } from 'next/server'
import { createSupabaseServerClient } from '@/lib/supabase'
import { candidateScannerAccessHashes, verifyEntryPassToken } from '@/lib/checkin/tokens'
import { broadcastCheckin } from '@/lib/checkin/broadcast'

interface AmendBody {
  eventId?: string
  accessToken?: string
  /** Identify the guest the same two ways a scan can. */
  qrToken?: string
  invitationId?: string
  /** The corrected number of people who actually arrived. */
  checkedInPartySize?: number
  doorLabel?: string
}

/**
 * Corrects how many of an already-admitted party actually arrived.
 *
 * Exists as its own route because check-in is deliberately first-scan-wins:
 * checkin_guest_invitation() only updates rows where checked_in_at IS NULL,
 * so a second scan can never silently rewrite an admission. That's the right
 * default for the door, but it leaves no way to fix "RSVP'd 3, only 2 came"
 * once the pass is scanned.
 *
 * Keeping it separate from /scan means a genuine duplicate scan still reads
 * as a duplicate, and every headcount correction is an explicit, intentional
 * action rather than a side effect of re-scanning.
 */
export async function POST(request: Request) {
  const { eventId, accessToken, qrToken, invitationId, checkedInPartySize, doorLabel } =
    (await request.json().catch(() => ({}))) as AmendBody

  if (!eventId || !accessToken || typeof checkedInPartySize !== 'number') {
    return NextResponse.json({ status: 'error', message: 'Malformed request' }, { status: 400 })
  }
  if (!qrToken && !invitationId) {
    return NextResponse.json({ status: 'error', message: 'Malformed request' }, { status: 400 })
  }

  const supabase = createSupabaseServerClient()

  const { data: access } = await supabase
    .from('scanner_access_tokens')
    .select('id, revoked_at, expires_at')
    .in('token_hash', candidateScannerAccessHashes(accessToken))
    .eq('event_id', eventId)
    .maybeSingle()
  if (!access || access.revoked_at || new Date(access.expires_at).getTime() < Date.now()) {
    return NextResponse.json(
      { status: 'error', message: 'Scanner session expired — log in again' },
      { status: 401 }
    )
  }

  let targetInvitationId: string
  if (qrToken) {
    const payload = verifyEntryPassToken(qrToken)
    if (!payload) return NextResponse.json({ status: 'invalid', message: 'Not a valid entry pass' })
    targetInvitationId = payload.invitationId
  } else {
    targetInvitationId = invitationId as string
  }

  const { data: invitation } = await supabase
    .from('guest_invitations')
    .select('id, event_id, guest_contact_id, party_size, checked_in_at')
    .eq('id', targetInvitationId)
    .maybeSingle()

  if (!invitation || invitation.event_id !== eventId) {
    return NextResponse.json({ status: 'invalid', message: 'This pass is not for this event' })
  }
  if (!invitation.checked_in_at) {
    return NextResponse.json({ status: 'invalid', message: 'This guest has not been checked in yet' })
  }

  // Clamp to 1..party_size for the same reason the RPC does: never let a
  // client inflate the headcount past what was actually invited.
  const rsvpd = invitation.party_size ?? 1
  const amended = Math.min(Math.max(checkedInPartySize, 1), Math.max(rsvpd, 1))

  const { error } = await supabase
    .from('guest_invitations')
    .update({ checked_in_party_size: amended })
    .eq('id', targetInvitationId)
  if (error) {
    return NextResponse.json({ status: 'error', message: 'Could not update headcount' }, { status: 500 })
  }

  const { data: guest } = await supabase
    .from('guest_contacts')
    .select('full_name')
    .eq('id', invitation.guest_contact_id)
    .maybeSingle()

  // Re-broadcast so live dashboards converge on the corrected number rather
  // than keeping the optimistic full-party figure from the original scan.
  await broadcastCheckin(eventId, {
    status: 'success',
    guestName: guest?.full_name ?? 'Guest',
    partySize: amended,
    doorLabel: doorLabel || 'Main Gate',
    at: invitation.checked_in_at,
  })

  return NextResponse.json({
    status: 'success',
    guestName: guest?.full_name ?? 'Guest',
    partySize: rsvpd,
    checkedInPartySize: amended,
  })
}
