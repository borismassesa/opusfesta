import { NextResponse } from 'next/server'
import { createSupabaseAdminClient } from '@/lib/supabase'
import { getCurrentVendor } from '@/lib/vendor'
import { BOOKING_SELECT, mapDbBooking, type DbBookingRow } from '@/lib/booking-db'
import { notifyBookingEventEmail } from '@/lib/email/notify-leads-bookings'

const ALLOWED_STAGES = new Set(['quoted', 'reserved', 'confirmed', 'completed', 'cancelled'])
const ALLOWED_INTERNAL = new Set([
  'quote_sent', 'quote_accepted', 'contract_sent', 'contract_signed',
  'deposit_pending', 'confirmed', 'reschedule_requested', 'rescheduled',
  'completed', 'cancelled',
])
const MUTABLE_FIELDS = new Set([
  'event_date', 'start_time', 'end_time',
  'deposit_paid', 'balance_due_date', 'contract_sent_at', 'contract_signed',
  'invoice_issued', 'brief_submitted', 'slot_held_until',
  'last_message_at', 'last_message_preview',
  'review_requested', 'review_received',
  'cancellation_reason', 'cancelled_at',
])

// Fields whose accepted value must look like an ISO date / time. Without
// these guards a vendor could PATCH any string into event_date and break
// downstream date math (or pollute the audit timeline). Wider booking-conflict
// checks would be ideal but are out of scope; format validation is the minimum.
const DATE_FIELDS = new Set(['event_date', 'balance_due_date'])
const TIME_FIELDS = new Set(['start_time', 'end_time'])
const TIMESTAMP_FIELDS = new Set(['contract_sent_at', 'slot_held_until', 'last_message_at', 'cancelled_at'])

const DATE_RE = /^\d{4}-\d{2}-\d{2}$/
const TIME_RE = /^\d{2}:\d{2}(:\d{2})?$/

/** Returns an error string if invalid, else null. */
function validateMutableField(field: string, value: unknown): string | null {
  if (value === null) return null // explicit clear
  if (DATE_FIELDS.has(field)) {
    if (typeof value !== 'string' || !DATE_RE.test(value)) {
      return `${field} must be YYYY-MM-DD`
    }
    if (Number.isNaN(new Date(`${value}T00:00:00`).getTime())) {
      return `${field} is not a valid date`
    }
  }
  if (TIME_FIELDS.has(field)) {
    if (typeof value !== 'string' || !TIME_RE.test(value)) {
      return `${field} must be HH:MM (or HH:MM:SS)`
    }
  }
  if (TIMESTAMP_FIELDS.has(field)) {
    if (typeof value !== 'string' || Number.isNaN(new Date(value).getTime())) {
      return `${field} must be an ISO 8601 timestamp`
    }
  }
  return null
}

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  const { id } = await params
  const state = await getCurrentVendor()
  if (state.kind !== 'live') {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const supabase = createSupabaseAdminClient()
  const { data, error } = await supabase
    .from('vendor_bookings')
    .select(BOOKING_SELECT)
    .eq('id', id)
    .eq('vendor_id', state.vendor.id)
    .maybeSingle<DbBookingRow>()

  if (error) {
    console.error('[bookings] get failed', error)
    return NextResponse.json({ error: 'Failed to fetch booking' }, { status: 500 })
  }
  if (!data) {
    return NextResponse.json({ error: 'Booking not found' }, { status: 404 })
  }

  return NextResponse.json({ booking: mapDbBooking(data) })
}

export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  const { id } = await params
  const state = await getCurrentVendor()
  if (state.kind !== 'live') {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  let body: Record<string, unknown>
  try {
    body = (await request.json()) as Record<string, unknown>
  } catch {
    return NextResponse.json({ error: 'Invalid JSON body' }, { status: 400 })
  }

  if (body.stage !== undefined && !ALLOWED_STAGES.has(body.stage as string)) {
    return NextResponse.json({ error: 'Invalid stage' }, { status: 400 })
  }
  if (body.internal_status !== undefined && !ALLOWED_INTERNAL.has(body.internal_status as string)) {
    return NextResponse.json({ error: 'Invalid internal_status' }, { status: 400 })
  }

  const supabase = createSupabaseAdminClient()

  // Confirm ownership and fetch current timeline before writing.
  const { data: existing, error: ownerErr } = await supabase
    .from('vendor_bookings')
    .select('id, timeline, partner_a, partner_b, email, event_date')
    .eq('id', id)
    .eq('vendor_id', state.vendor.id)
    .maybeSingle<{
      id: string
      timeline: unknown
      partner_a: string | null
      partner_b: string | null
      email: string | null
      event_date: string | null
    }>()

  if (ownerErr) {
    console.error('[bookings] ownership check failed', ownerErr.code)
    return NextResponse.json({ error: 'Failed to fetch booking' }, { status: 500 })
  }
  if (!existing) {
    return NextResponse.json({ error: 'Booking not found' }, { status: 404 })
  }

  const update: Record<string, unknown> = { updated_at: new Date().toISOString() }

  if (body.stage !== undefined) update.stage = body.stage
  if (body.internal_status !== undefined) update.internal_status = body.internal_status

  for (const field of MUTABLE_FIELDS) {
    if (body[field] === undefined) continue
    const err = validateMutableField(field, body[field])
    if (err) return NextResponse.json({ error: err }, { status: 400 })
    update[field] = body[field]
  }

  // Append a timeline entry if provided.
  if (body.timeline_entry !== undefined) {
    if (typeof body.timeline_entry !== 'object' || body.timeline_entry === null || Array.isArray(body.timeline_entry)) {
      return NextResponse.json({ error: 'timeline_entry must be an object' }, { status: 400 })
    }
    const prev = Array.isArray(existing.timeline) ? existing.timeline : []
    update.timeline = [...prev, body.timeline_entry]
  }

  const { error } = await supabase
    .from('vendor_bookings')
    .update(update)
    .eq('id', id)
    .eq('vendor_id', state.vendor.id)

  if (error) {
    console.error('[bookings] patch failed', error)
    return NextResponse.json({ error: 'Update failed' }, { status: 500 })
  }

  let eventLabel: string | null = null
  if (body.stage === 'reserved' || body.internal_status === 'quote_accepted') {
    eventLabel = 'Offer accepted'
  } else if (body.internal_status === 'contract_sent') {
    eventLabel = 'Contract sent'
  } else if (body.deposit_paid === true) {
    eventLabel = 'Deposit received'
  } else if (body.stage === 'confirmed') {
    eventLabel = 'Booking confirmed'
  } else if (body.stage === 'cancelled') {
    eventLabel = 'Booking cancelled'
  } else if (body.review_requested === true) {
    eventLabel = 'Review requested'
  }

  if (eventLabel) {
    void notifyBookingEventEmail({
      recipientEmail: existing.email,
      recipientName: [existing.partner_a, existing.partner_b].filter(Boolean).join(' & ') || null,
      vendorName: state.vendor.businessName,
      bookingId: existing.id,
      eventDate: existing.event_date,
      eventLabel,
    })
  }

  return NextResponse.json({ success: true })
}
