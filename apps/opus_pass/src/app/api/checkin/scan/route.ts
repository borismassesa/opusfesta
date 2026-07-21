import { NextResponse } from 'next/server'
import { createSupabaseServerClient } from '@/lib/supabase'
import { candidateScannerAccessHashes, verifyEntryPassToken } from '@/lib/checkin/tokens'
import { broadcastCheckin } from '@/lib/checkin/broadcast'
import { RATE_LIMITED_RESPONSE, withinRateLimit } from '@/lib/checkin/rate-limit'

interface ScanBody {
  eventId?: string
  /** Door-staff bearer code proving this device may scan for this event. */
  accessToken?: string
  /** The scanned QR string. Required unless this is a manual override. */
  qrToken?: string
  /** Manual-override path (guest lost their phone): the attendant picks the
   *  guest from the roster instead of scanning. Requires manualReason. */
  invitationId?: string
  /** Short code printed on the ticket, used when the QR won't scan. */
  entryCode?: string
  manualReason?: string
  /** How many of the party actually walked in. Defaults to the full RSVP'd
   *  party server-side when omitted. */
  checkedInPartySize?: number
  doorLabel?: string
  attendantName?: string
}

/**
 * Scans a guest's entry-pass QR and checks them in, or reports why not.
 *
 * Two independent credentials are verified server-side on every request, and
 * neither is ever trusted from the client:
 *  - accessToken: proves this device may scan for this event
 *  - qrToken: proves this QR is a genuine, unmodified entry pass
 *
 * CHECKIN_TOKEN_SECRET stays server-side by design — the mobile app relays
 * the scanned string and never verifies it, because a secret shipped in an
 * app bundle can be extracted and used to forge passes.
 *
 * Ported from apps/opus_scanner/src/app/api/checkin/route.ts, extended with
 * partial-party arrival and a token-free manual-override path.
 */
/** Fold typing variations onto the stored form: uppercase, no separators,
 *  and look-alike characters mapped onto the alphabet actually in use. */
function normaliseEntryCode(input: string): string {
  return input
    .trim()
    .toUpperCase()
    .replace(/[^0-9A-Z]/g, '')
    .replace(/O/g, '0')
    .replace(/[IL]/g, '1')
}

export async function POST(request: Request) {
  const body = (await request.json().catch(() => ({}))) as ScanBody
  const { eventId, accessToken, qrToken, invitationId, entryCode, manualReason, doorLabel, attendantName } =
    body

  if (!eventId || !accessToken) {
    return NextResponse.json({ status: 'error', message: 'Malformed request' }, { status: 400 })
  }
  // Exactly one admission path must be supplied. A manual override must carry
  // a reason so the audit trail can always explain a scan-less admission.
  // A scan carries a QR; every scan-less admission (roster pick or typed
  // code) must carry a reason so the audit trail can explain it.
  if (!qrToken && !((invitationId || entryCode) && manualReason)) {
    return NextResponse.json({ status: 'error', message: 'Malformed request' }, { status: 400 })
  }

  const supabase = createSupabaseServerClient()

  const { data: access } = await supabase
    .from('scanner_access_tokens')
    .select('id, revoked_at, expires_at, attendant_name')
    .in('token_hash', candidateScannerAccessHashes(accessToken))
    .eq('event_id', eventId)
    .maybeSingle()
  if (!access || access.revoked_at || new Date(access.expires_at).getTime() < Date.now()) {
    return NextResponse.json(
      { status: 'error', message: 'Scanner session expired — log in again' },
      { status: 401 }
    )
  }

  // Keyed on the verified door token, not IP — attendants share venue wifi.
  // 120/min comfortably covers a busy door (a scan every couple of seconds);
  // the entry-code path below gets its own much tighter budget because a
  // typed 6-char code is the one credential-shaped thing short enough to
  // enumerate, and manual entry is never faster than a few seconds per try.
  if (!(await withinRateLimit(supabase, `scan:${access.id}`, 120, 60))) {
    return NextResponse.json(RATE_LIMITED_RESPONSE, { status: 429 })
  }
  if (entryCode && !(await withinRateLimit(supabase, `scan-code:${access.id}`, 15, 60))) {
    return NextResponse.json(RATE_LIMITED_RESPONSE, { status: 429 })
  }

  // An admin-assigned code carries its own authoritative name; the device
  // holder cannot override it. The request-body name only applies to couple
  // self-serve codes, where the attendant types their own name at login.
  const effectiveAttendantName = access.attendant_name || attendantName

  // Resolve which invitation is being admitted. For a camera scan this comes
  // from the signed token (never from a client-supplied id); for a manual
  // override the attendant picked it off the roster we issued them.
  let targetInvitationId: string
  if (qrToken) {
    const payload = verifyEntryPassToken(qrToken)
    if (!payload) {
      return NextResponse.json({ status: 'invalid', message: 'Not a valid entry pass' })
    }
    targetInvitationId = payload.invitationId
  } else if (entryCode) {
    // Scoped to this event, which is why a 6-character code is enough: it
    // only has to be unique among one guest list, and it identifies rather
    // than authorises — the door token above is what grants access.
    const { data: byCode } = await supabase
      .from('guest_invitations')
      .select('id')
      .eq('event_id', eventId)
      .eq('entry_code', normaliseEntryCode(entryCode))
      .maybeSingle()
    if (!byCode) {
      return NextResponse.json({ status: 'invalid', message: 'No guest found with that code' })
    }
    targetInvitationId = byCode.id
  } else {
    targetInvitationId = invitationId as string
  }

  // The invitation must belong to THIS event and still be an active
  // "attending" RSVP. This is what stops a pass for another event/couple
  // validating at this door, and is also how revocation works: a guest the
  // couple later moved off "attending" is refused even though their token is
  // still cryptographically valid — no separate revocation table needed.
  const { data: invitation } = await supabase
    .from('guest_invitations')
    .select('id, event_id, guest_contact_id, party_size, checked_in_at, checked_in_party_size, rsvp_status')
    .eq('id', targetInvitationId)
    .eq('event_id', eventId)
    .maybeSingle()

  if (!invitation) {
    return NextResponse.json({ status: 'invalid', message: 'This pass is not for this event' })
  }
  if (invitation.rsvp_status !== 'attending') {
    return NextResponse.json({ status: 'invalid', message: 'This guest is no longer marked as attending' })
  }

  const { data: guest } = await supabase
    .from('guest_contacts')
    .select('full_name, group_tag')
    .eq('id', invitation.guest_contact_id)
    .maybeSingle()

  const guestName = guest?.full_name ?? 'Guest'
  const groupTag = guest?.group_tag ?? null
  const isVip = /vip/i.test(groupTag ?? '')
  const displayDoor = doorLabel || 'Main Gate'
  const rsvpdPartySize = invitation.party_size ?? 1

  // The audit trail records who was holding the device and why, while the
  // broadcast/UI door label stays plain so the live feed reads cleanly.
  const auditLabel = [
    effectiveAttendantName || 'Unknown attendant',
    `(${displayDoor})`,
    manualReason ? `(manual: ${manualReason})` : null,
  ]
    .filter(Boolean)
    .join(' ')

  if (invitation.checked_in_at) {
    await broadcastCheckin(eventId, {
      status: 'duplicate',
      guestName,
      partySize: invitation.checked_in_party_size ?? rsvpdPartySize,
      doorLabel: displayDoor,
      at: invitation.checked_in_at,
    })
    return NextResponse.json({
      status: 'duplicate',
      guestName,
      partySize: rsvpdPartySize,
      checkedInPartySize: invitation.checked_in_party_size,
      checkedInAt: invitation.checked_in_at,
      isVip,
      groupTag,
    })
  }

  const { data: updated, error } = await supabase.rpc('checkin_guest_invitation', {
    p_guest_invitation_id: targetInvitationId,
    p_checked_in_by: auditLabel,
    p_checked_in_door: displayDoor,
    // Null lets the RPC default to the full RSVP'd party; it also clamps to
    // 1..party_size, so a malformed client can't inflate the headcount.
    p_checked_in_party_size:
      typeof body.checkedInPartySize === 'number' ? body.checkedInPartySize : null,
  })
  if (error) return NextResponse.json({ status: 'error', message: 'Check-in failed' }, { status: 500 })

  // The RPC returns an all-null row (not an error) when another device won
  // the race between our lookup above and the atomic UPDATE.
  if (!updated || !updated.checked_in_at) {
    await broadcastCheckin(eventId, {
      status: 'duplicate',
      guestName,
      partySize: rsvpdPartySize,
      doorLabel: displayDoor,
      at: new Date().toISOString(),
    })
    return NextResponse.json({
      status: 'duplicate',
      guestName,
      partySize: rsvpdPartySize,
      checkedInPartySize: null,
      checkedInAt: null,
      isVip,
      groupTag,
    })
  }

  const admitted = updated.checked_in_party_size ?? rsvpdPartySize

  await broadcastCheckin(eventId, {
    status: 'success',
    guestName,
    partySize: admitted,
    doorLabel: displayDoor,
    at: updated.checked_in_at,
  })

  return NextResponse.json({
    status: 'success',
    guestName,
    partySize: rsvpdPartySize,
    checkedInPartySize: admitted,
    isVip,
    groupTag,
  })
}
