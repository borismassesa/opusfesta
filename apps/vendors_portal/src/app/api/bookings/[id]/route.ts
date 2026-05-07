import { NextResponse } from 'next/server'
import { createSupabaseAdminClient } from '@/lib/supabase'
import { getCurrentVendor } from '@/lib/vendor'
import { BOOKING_SELECT, mapDbBooking, type DbBookingRow } from '@/lib/booking-db'

const ALLOWED_STAGES = new Set(['quoted', 'reserved', 'confirmed', 'completed', 'cancelled'])
const ALLOWED_INTERNAL = new Set([
  'quote_sent', 'quote_accepted', 'contract_sent', 'contract_signed',
  'deposit_pending', 'confirmed', 'reschedule_requested', 'rescheduled',
  'completed', 'cancelled',
])
const MUTABLE_FIELDS = new Set([
  'deposit_paid', 'balance_due_date', 'contract_sent_at', 'contract_signed',
  'invoice_issued', 'brief_submitted', 'slot_held_until',
  'last_message_at', 'last_message_preview',
  'review_requested', 'review_received',
  'cancellation_reason', 'cancelled_at',
])

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
  const { data: existing } = await supabase
    .from('vendor_bookings')
    .select('id, timeline')
    .eq('id', id)
    .eq('vendor_id', state.vendor.id)
    .maybeSingle<{ id: string; timeline: unknown }>()

  if (!existing) {
    return NextResponse.json({ error: 'Booking not found' }, { status: 404 })
  }

  const update: Record<string, unknown> = { updated_at: new Date().toISOString() }

  if (body.stage !== undefined) update.stage = body.stage
  if (body.internal_status !== undefined) update.internal_status = body.internal_status

  for (const field of MUTABLE_FIELDS) {
    if (body[field] !== undefined) update[field] = body[field]
  }

  // Append a timeline entry if provided.
  if (body.timeline_entry !== undefined) {
    const prev = Array.isArray(existing.timeline) ? existing.timeline : []
    update.timeline = [...prev, body.timeline_entry]
  }

  const { error } = await supabase
    .from('vendor_bookings')
    .update(update)
    .eq('id', id)

  if (error) {
    console.error('[bookings] patch failed', error)
    return NextResponse.json({ error: 'Update failed' }, { status: 500 })
  }

  return NextResponse.json({ success: true })
}
