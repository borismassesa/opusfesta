import { createDashboardClient } from '@/lib/dashboard/supabase'
import { createNotification } from '@/lib/dashboard/notifications'
import { formatLongDate } from '@/lib/dashboard/share'
import { BTN, getWhatsAppProvider, parseInboundButtons, parseStatusUpdates, verifyWebhookSignature, webhookVerifyToken } from '@/lib/whatsapp'

export const dynamic = 'force-dynamic'

// Meta Cloud API verification handshake: echo hub.challenge when the token matches.
export async function GET(req: Request) {
  const url = new URL(req.url)
  const mode = url.searchParams.get('hub.mode')
  const token = url.searchParams.get('hub.verify_token')
  const challenge = url.searchParams.get('hub.challenge')
  const expected = webhookVerifyToken()
  if (mode === 'subscribe' && expected && token === expected && challenge) {
    return new Response(challenge, { status: 200, headers: { 'content-type': 'text/plain' } })
  }
  return new Response('forbidden', { status: 403 })
}

// Inbound events: quick-reply button taps → update the guest's RSVP. Always
// returns 200 fast so Meta doesn't retry on slow processing; idempotency is
// enforced by the unique wamid in whatsapp_messages.
export async function POST(req: Request) {
  // Read the raw body first: the signature is computed over the exact bytes,
  // so we cannot let the framework parse/re-serialize it before verifying.
  const raw = await req.text()
  if (!verifyWebhookSignature(raw, req.headers.get('x-hub-signature-256'))) {
    return new Response('invalid signature', { status: 403 })
  }

  let body: unknown
  try {
    body = JSON.parse(raw)
  } catch {
    return new Response('ok', { status: 200 })
  }

  const taps = parseInboundButtons(body)
  const statusUpdates = parseStatusUpdates(body)
  if (taps.length === 0 && statusUpdates.length === 0) return new Response('ok', { status: 200 })

  const supabase = createDashboardClient()
  const provider = getWhatsAppProvider()

  // Delivery lifecycle of OUR messages: sent → delivered → read, or failed.
  // Never downgrade (events can arrive out of order); failed is terminal in
  // both directions — it always applies over sent/delivered/read, and a late
  // sent/delivered event must never mask a recorded failure.
  const STATUS_RANK: Record<string, number> = { sent: 1, delivered: 2, read: 3 }
  for (const su of statusUpdates) {
    const { data: row } = await supabase
      .from('whatsapp_messages')
      .select('id, status')
      .eq('wamid', su.wamid)
      .eq('direction', 'out')
      .maybeSingle<{ id: string; status: string | null }>()
    if (!row) continue
    if (row.status === 'failed' && su.status !== 'failed') continue
    if (su.status !== 'failed' && (STATUS_RANK[row.status ?? ''] ?? 0) >= STATUS_RANK[su.status]) continue
    await supabase
      .from('whatsapp_messages')
      .update(su.error ? { status: su.status, error: su.error } : { status: su.status })
      .eq('id', row.id)
  }

  for (const tap of taps) {
    // Idempotency: first writer wins; a duplicate wamid is silently skipped.
    const { error: dupeErr } = await supabase
      .from('whatsapp_messages')
      .insert({ direction: 'in', wamid: tap.wamid, kind: tap.kind, status: 'received' })
    if (dupeErr) continue // unique violation → already processed

    // Resolve the guest: token from the button payload, else sender phone.
    const guestQuery = supabase.from('guest_contacts').select('id, user_id, full_name')
    const { data: guest } = tap.token
      ? await guestQuery.eq('public_token', tap.token).maybeSingle<{ id: string; user_id: string; full_name: string }>()
      : await guestQuery.eq('phone', tap.from).maybeSingle<{ id: string; user_id: string; full_name: string }>()
    if (!guest) continue

    await supabase
      .from('whatsapp_messages')
      .update({ user_id: guest.user_id, guest_contact_id: guest.id, status: 'processed' })
      .eq('wamid', tap.wamid)

    if (tap.kind === BTN.RSVP_YES || tap.kind === BTN.RSVP_NO) {
      const status = tap.kind === BTN.RSVP_YES ? 'attending' : 'declined'
      // Unified roster: a tap must never be lost because the guest predates
      // event linking — create any missing invitation rows before recording.
      const { data: evs } = await supabase
        .from('wedding_events')
        .select('id')
        .eq('user_id', guest.user_id)
      const eventIds = (evs ?? []).map((e) => e.id as string)
      if (eventIds.length) {
        const { data: have } = await supabase
          .from('guest_invitations')
          .select('event_id')
          .eq('guest_contact_id', guest.id)
        const haveSet = new Set((have ?? []).map((r) => r.event_id as string))
        const missing = eventIds.filter((id) => !haveSet.has(id))
        if (missing.length) {
          await supabase
            .from('guest_invitations')
            .insert(missing.map((event_id) => ({ user_id: guest.user_id, guest_contact_id: guest.id, event_id })))
        }
      }
      await supabase
        .from('guest_invitations')
        .update({ rsvp_status: status, responded_at: new Date().toISOString() })
        .eq('guest_contact_id', guest.id)
      await createNotification({
        userId: guest.user_id,
        type: 'rsvp_received',
        title: `${guest.full_name} responded on WhatsApp`,
        body: status === 'attending' ? 'Attending' : 'Declined',
        href: '/my/dashboard/rsvps',
      })
    } else if (tap.kind === BTN.VIEW_LOCATION) {
      // Reply with the soonest event's venue.
      const { data: ev } = await supabase
        .from('wedding_events')
        .select('name, venue_name, address, city, starts_at')
        .eq('user_id', guest.user_id)
        .eq('is_public', true)
        .order('starts_at', { ascending: true, nullsFirst: false })
        .limit(1)
        .maybeSingle<{ name: string; venue_name: string | null; address: string | null; city: string | null; starts_at: string | null }>()
      if (ev) {
        const place = [ev.venue_name, ev.address, ev.city].filter(Boolean).join(', ')
        const maps = place ? `https://maps.google.com/?q=${encodeURIComponent(place)}` : ''
        const when = formatLongDate(ev.starts_at)
        const msg =
          `📍 ${ev.name}\n${place || 'Venue TBC'}` +
          (when ? `\n🗓️ ${when}` : '') +
          (maps ? `\n${maps}` : '')
        await provider.sendText(tap.from, msg)
      }
    }
  }

  return new Response('ok', { status: 200 })
}
