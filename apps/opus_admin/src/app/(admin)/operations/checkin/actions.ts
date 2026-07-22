'use server'

import { revalidatePath } from 'next/cache'
import { requirePermission, getCallerEmail } from '@/lib/admin-auth'
import { createSupabaseAdminClient } from '@/lib/supabase'
import { generateEntryPassQrDataUrl, generateScannerAccessToken } from '@/lib/checkin-tokens'
import { accessCodeExpiry, type AccessCodeValidity } from '@/lib/checkin-code'
import { renderGuestTicketSvg, ticketIntroLabel, formatTicketDate, type TicketLanguage } from '@/lib/ticket-render'
import { MAX_IMPORT_ROWS, parseGuestRows } from '@/lib/guest-csv'

export interface AttendantAssignment {
  id: string
  doorLabel: string
  attendantName: string
  expiresAt: string
  revokedAt: string | null
  lastUsedAt: string | null
  createdAt: string
}

export type AssignAttendantResult =
  | { ok: true; token: string; link: string; expiresAt: string; linkWarning?: string }
  | { ok: false; error: string }

export type RevokeAttendantResult = { ok: true } | { ok: false; error: string }

/**
 * Assign a named attendant to an OpusPass event's door and mint their
 * scanner link. Mirrors apps/opus_pass's generateScannerAccessToken()
 * (couple self-serve), but issued with assigned_by='admin' and an
 * authoritative attendant_name — see the schema note in
 * supabase/migrations/20260630000002_opuspass_checkin_admin_attendants.sql.
 *
 * scanner_access_tokens.user_id is NOT NULL and must be the event's owning
 * couple (that's who the owner-only RLS policy checks) — admin is acting
 * ON BEHALF OF the couple here, not as a separate identity, so the couple's
 * own dashboard (DoorStaffAccessCard, LiveAttendance) sees and can revoke
 * admin-assigned attendants alongside their own, which is the correct
 * behavior for "it's still their event."
 */
export async function assignAttendant(
  eventId: string,
  attendantName: string,
  doorLabel: string,
  validity: AccessCodeValidity = 'event',
): Promise<AssignAttendantResult> {
  await requirePermission('opuspass.checkin')
  const name = attendantName.trim()
  if (!name) return { ok: false, error: 'Attendant name is required' }

  const supabase = createSupabaseAdminClient()

  const { data: event, error: eventErr } = await supabase
    .from('wedding_events')
    .select('id, user_id, starts_at')
    .eq('id', eventId)
    .maybeSingle<{ id: string; user_id: string; starts_at: string | null }>()
  if (eventErr) return { ok: false, error: eventErr.message }
  if (!event) return { ok: false, error: 'Event not found' }

  const { rawToken, tokenHash } = generateScannerAccessToken()
  const expiresAt = accessCodeExpiry(validity, event.starts_at)

  const { error } = await supabase.from('scanner_access_tokens').insert({
    user_id: event.user_id,
    event_id: eventId,
    door_label: doorLabel.trim() || 'Main Gate',
    token_hash: tokenHash,
    expires_at: expiresAt,
    attendant_name: name,
    assigned_by: 'admin',
  })
  if (error) return { ok: false, error: error.message }

  const callerEmail = await getCallerEmail()
  console.warn('[opuspass-checkin] admin assigned attendant', { eventId, attendantName: name, by: callerEmail })

  // A relative fallback here silently produces a link that only resolves
  // inside opus_admin's own origin — pasted into WhatsApp/SMS or opened
  // directly it becomes a broken file:// URL. Fail loudly instead: the
  // token is already minted and valid, so we still return it (the admin
  // can build the link by hand from the code), but surface the missing
  // config clearly rather than a link that silently doesn't work.
  const scannerOrigin = (process.env.NEXT_PUBLIC_OPUS_SCANNER_URL || '').replace(/\/$/, '')
  if (!scannerOrigin) {
    console.error('[opuspass-checkin] NEXT_PUBLIC_OPUS_SCANNER_URL is not set — cannot build an absolute scanner link')
    revalidatePath(`/operations/checkin/${eventId}`)
    return {
      ok: true,
      token: rawToken,
      link: '',
      expiresAt,
      linkWarning: 'NEXT_PUBLIC_OPUS_SCANNER_URL is not configured — share the code manually, or set that env var and reassign.',
    }
  }
  const link = `${scannerOrigin}/event/${eventId}?token=${encodeURIComponent(rawToken)}`

  revalidatePath(`/operations/checkin/${eventId}`)
  return { ok: true, token: rawToken, link, expiresAt }
}

export async function listAttendants(eventId: string): Promise<AttendantAssignment[]> {
  await requirePermission('opuspass.checkin')
  const supabase = createSupabaseAdminClient()
  const { data, error } = await supabase
    .from('scanner_access_tokens')
    .select('id, door_label, attendant_name, expires_at, revoked_at, last_used_at, created_at, assigned_by')
    .eq('event_id', eventId)
    .eq('assigned_by', 'admin')
    .order('created_at', { ascending: false })
  if (error) throw new Error(error.message)
  return (data ?? []).map((r) => ({
    id: r.id as string,
    doorLabel: r.door_label as string,
    attendantName: (r.attendant_name as string | null) ?? 'Unnamed',
    expiresAt: r.expires_at as string,
    revokedAt: r.revoked_at as string | null,
    lastUsedAt: r.last_used_at as string | null,
    createdAt: r.created_at as string,
  }))
}

export async function revokeAttendant(tokenId: string, eventId: string): Promise<RevokeAttendantResult> {
  await requirePermission('opuspass.checkin')
  const supabase = createSupabaseAdminClient()
  const { error } = await supabase
    .from('scanner_access_tokens')
    .update({ revoked_at: new Date().toISOString() })
    .eq('id', tokenId)
    .eq('assigned_by', 'admin')
  if (error) return { ok: false, error: error.message }
  revalidatePath(`/operations/checkin/${eventId}`)
  return { ok: true }
}

// ---------------------------------------------------------------- Guest import + tickets

export interface ImportedGuestTicket {
  invitationId: string
  guestContactId: string
  fullName: string
  partySize: number
  groupTag: string | null
  isNewGuest: boolean
  /** Entry-pass QR as a data: URL — same format the guest would see on
   * their own RSVP confirmation page if they'd RSVP'd themselves. */
  qrDataUrl: string
  /** Full stamped ticket artwork (SVG markup) — couple names/date/venue +
   * this guest's QR, ready to render inline or print. */
  ticketSvg: string
}

export type ImportGuestsResult =
  | { ok: true; imported: ImportedGuestTicket[]; skipped: { line: string; reason: string }[] }
  | { ok: false; error: string }

/**
 * Bulk-import a list of guests who are already known to be attending (e.g.
 * a paper/offline guest list, or a couple who RSVP'd guests outside
 * OpusPass) and pre-generate their entry-pass QR tickets, ready to be
 * printed/shared before the event — no self-serve RSVP step required.
 *
 * One line per guest: `Full Name, email-or-phone, party size, group`
 * (only the name is required). Existing guests are matched by
 * case-insensitive full-name lookup within the event's couple (scoped by
 * user_id, same as everywhere else in this table) to avoid duplicate
 * guest_contacts rows on repeat imports; the per-event invitation is
 * upserted on the (guest_contact_id, event_id) unique constraint so
 * re-running an import (e.g. to fix a typo) is safe.
 */
export async function importGuestsWithTickets(eventId: string, rawText: string): Promise<ImportGuestsResult> {
  await requirePermission('opuspass.tickets')
  const supabase = createSupabaseAdminClient()

  const { data: event, error: eventErr } = await supabase
    .from('wedding_events')
    .select('id, user_id, name, event_type, ticket_language, venue_name, address, city, starts_at')
    .eq('id', eventId)
    .maybeSingle<{
      id: string
      user_id: string
      name: string
      event_type: string | null
      ticket_language: string | null
      venue_name: string | null
      address: string | null
      city: string | null
      starts_at: string | null
    }>()
  if (eventErr) return { ok: false, error: eventErr.message }
  if (!event) return { ok: false, error: 'Event not found' }

  const { data: couple } = await supabase
    .from('couple_profiles')
    .select('partner1_name, partner2_name, invite_host_name')
    .eq('user_id', event.user_id)
    .maybeSingle<{ partner1_name: string | null; partner2_name: string | null; invite_host_name: string | null }>()

  // Same labels, precedence and formats as apps/opus_pass's
  // getEntrancePassData(), so a manually-admitted guest's ticket reads
  // exactly like the WhatsApp-sent pass: confirmed host name > partner names
  // > event name; the category intro line and date honor the event's ticket
  // language. Date only — the ticket never carries a time.
  const lang: TicketLanguage = event.ticket_language === 'sw' ? 'sw' : 'en'
  const hostOverride = couple?.invite_host_name?.trim() || null
  const partnerNames = [couple?.partner1_name, couple?.partner2_name].filter(Boolean)
  const startsAt = event.starts_at ? new Date(event.starts_at) : null
  const hasValidDate = startsAt !== null && !Number.isNaN(startsAt.getTime())
  const ticketBaseFields = {
    introLabel: ticketIntroLabel(event.event_type || 'other', lang),
    coupleName: hostOverride ?? (partnerNames.length ? partnerNames.join(' & ') : event.name),
    dateLabel: hasValidDate ? formatTicketDate(startsAt, lang) : '',
    // Venue name on the first ticket row, the city on its own second row —
    // matches apps/opus_pass's getEntrancePassData. The event's free-form
    // `address` is intentionally left off the ticket (not part of the
    // ticket-details form the couple edits).
    venue: event.venue_name || '',
    city: event.city || '',
    ticketLanguage: lang,
  }

  if (!rawText.trim()) return { ok: false, error: 'Paste or upload at least one guest row' }
  const { rows: parsed, skipped } = parseGuestRows(rawText)
  if (parsed.length + skipped.length > MAX_IMPORT_ROWS) {
    return {
      ok: false,
      error: `Too many rows (${parsed.length + skipped.length}) — import in batches of ${MAX_IMPORT_ROWS} or fewer`,
    }
  }
  if (parsed.length === 0) return { ok: false, error: 'No valid guest rows found (every row was missing a name)' }

  // Case-insensitive dedupe against this couple's existing roster.
  const { data: existing } = await supabase
    .from('guest_contacts')
    .select('id, full_name')
    .eq('user_id', event.user_id)
    .returns<{ id: string; full_name: string }[]>()
  const existingByName = new Map<string, string>()
  for (const g of existing ?? []) existingByName.set(g.full_name.trim().toLowerCase(), g.id)

  const imported: ImportedGuestTicket[] = []
  for (const row of parsed) {
    const key = row.fullName.trim().toLowerCase()
    let guestContactId = existingByName.get(key)
    let isNewGuest = false

    if (!guestContactId) {
      const isEmail = row.contact?.includes('@') ?? false
      const { data: created, error: createErr } = await supabase
        .from('guest_contacts')
        .insert({
          user_id: event.user_id,
          full_name: row.fullName,
          email: isEmail ? row.contact : null,
          phone: !isEmail ? row.contact : null,
          group_tag: row.groupTag,
          max_party_size: row.partySize,
        })
        .select('id')
        .single<{ id: string }>()
      if (createErr || !created) {
        skipped.push({ line: row.fullName, reason: createErr?.message ?? 'Could not create guest record' })
        continue
      }
      guestContactId = created.id
      isNewGuest = true
      existingByName.set(key, guestContactId)
    }

    const { data: invitation, error: inviteErr } = await supabase
      .from('guest_invitations')
      .upsert(
        {
          user_id: event.user_id,
          guest_contact_id: guestContactId,
          event_id: eventId,
          rsvp_status: 'attending',
          party_size: row.partySize,
          responded_at: new Date().toISOString(),
        },
        { onConflict: 'guest_contact_id,event_id' },
      )
      .select('id')
      .single<{ id: string }>()
    if (inviteErr || !invitation) {
      skipped.push({ line: row.fullName, reason: inviteErr?.message ?? 'Could not create invitation' })
      continue
    }

    const qrDataUrl = await generateEntryPassQrDataUrl(guestContactId, invitation.id)
    const ticketSvg = renderGuestTicketSvg({
      ...ticketBaseFields,
      partySize: row.partySize,
      qrDataUrl,
    })
    imported.push({
      invitationId: invitation.id,
      guestContactId,
      fullName: row.fullName,
      partySize: row.partySize,
      groupTag: row.groupTag,
      isNewGuest,
      qrDataUrl,
      ticketSvg,
    })
  }

  const callerEmail = await getCallerEmail()
  console.warn('[opuspass-tickets] admin imported guests with tickets', {
    eventId,
    imported: imported.length,
    skipped: skipped.length,
    by: callerEmail,
  })

  revalidatePath(`/operations/checkin/${eventId}`)
  return { ok: true, imported, skipped }
}
