import { NextResponse } from 'next/server'
import { createSupabaseAdminClient } from '@/lib/supabase'
import { getCurrentVendor } from '@/lib/vendor'
import { BOOKING_SELECT, mapDbBooking, type DbBookingRow } from '@/lib/booking-db'

export async function GET() {
  const state = await getCurrentVendor()
  if (state.kind !== 'live') {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const supabase = createSupabaseAdminClient()
  const { data, error } = await supabase
    .from('vendor_bookings')
    .select(BOOKING_SELECT)
    .eq('vendor_id', state.vendor.id)
    .order('event_date', { ascending: true })
    .returns<DbBookingRow[]>()

  if (error) {
    console.error('[bookings] list failed', error)
    return NextResponse.json({ error: 'Failed to load bookings' }, { status: 500 })
  }

  return NextResponse.json({ bookings: (data ?? []).map(mapDbBooking) })
}

export async function POST(request: Request) {
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

  const {
    inquiry_id,
    event_date,
    start_time,
    end_time,
    partner_a,
    partner_b,
    phone,
    whatsapp,
    email,
    package_name,
    location,
    total_value,
    deposit_percent,
  } = body

  if (!event_date || !start_time || !end_time || !partner_a || !partner_b || !email || !package_name || !location || total_value === undefined) {
    return NextResponse.json({ error: 'Missing required fields' }, { status: 400 })
  }

  const value = Number(total_value)
  if (!Number.isFinite(value) || !Number.isInteger(value) || value < 0) {
    return NextResponse.json({ error: 'total_value must be a non-negative integer' }, { status: 400 })
  }

  const depositPct = Number(deposit_percent ?? 50)
  if (!Number.isFinite(depositPct) || !Number.isInteger(depositPct) || depositPct < 0 || depositPct > 100) {
    return NextResponse.json({ error: 'deposit_percent must be an integer between 0 and 100' }, { status: 400 })
  }
  const initialTimeline = [
    {
      at: new Date().toISOString(),
      kind: 'quote_sent',
      label: `Quote sent · TZS ${value.toLocaleString('en-GB')}`,
    },
  ]

  const supabase = createSupabaseAdminClient()
  const { data, error } = await supabase
    .from('vendor_bookings')
    .insert({
      vendor_id: state.vendor.id,
      inquiry_id: inquiry_id ?? null,
      event_date,
      start_time,
      end_time,
      partner_a,
      partner_b,
      phone: phone ?? null,
      whatsapp: whatsapp ?? null,
      email,
      package_name,
      location,
      total_value: value,
      deposit_percent: depositPct,
      stage: 'quoted',
      internal_status: 'quote_sent',
      timeline: initialTimeline,
    })
    .select(BOOKING_SELECT)
    .single<DbBookingRow>()

  if (error) {
    console.error('[bookings] create failed', error)
    return NextResponse.json({ error: 'Failed to create booking' }, { status: 500 })
  }

  return NextResponse.json({ booking: mapDbBooking(data) }, { status: 201 })
}
