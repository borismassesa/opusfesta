import { getCurrentVendor } from '@/lib/vendor'
import { createClerkSupabaseServerClient } from '@/lib/supabase'
import { BOOKING_SELECT, mapDbBooking, type DbBookingRow } from '@/lib/booking-db'
import { bookings as mockBookings } from '@/lib/mock-data'
import type { Booking } from '@/lib/mock-data'
import BookingsPipelineClient from './BookingsPipelineClient'

async function loadBookings(): Promise<Booking[]> {
  const state = await getCurrentVendor()

  if (state.kind === 'no-env') {
    return mockBookings
  }
  if (state.kind !== 'live') {
    return []
  }

  const supabase = await createClerkSupabaseServerClient()
  const { data, error } = await supabase
    .from('vendor_bookings')
    .select(BOOKING_SELECT)
    .eq('vendor_id', state.vendor.id)
    .order('event_date', { ascending: true })
    .returns<DbBookingRow[]>()

  if (error) {
    const payload = {
      code: error.code,
      message: error.message,
      details: error.details,
      hint: error.hint,
      vendorId: state.vendor.id,
    }

    if (error.code === 'PGRST205') {
      console.error(
        '[bookings page] query failed: schema cache is stale or relation missing',
        payload,
      )
    } else if (error.code === '42703') {
      console.error(
        '[bookings page] query failed: missing column in vendor_bookings (likely migration drift)',
        payload,
      )
    } else if (error.code === '42501') {
      console.error(
        '[bookings page] query failed: permission denied (RLS/auth context issue)',
        payload,
      )
    } else {
      console.error('[bookings page] query failed', payload)
    }

    return []
  }

  return (data ?? []).map(mapDbBooking)
}

export default async function BookingsPipelinePage() {
  const bookings = await loadBookings()
  return <BookingsPipelineClient initialBookings={bookings} />
}
