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
    console.error('[bookings page] query failed', error)
    return []
  }

  return (data ?? []).map(mapDbBooking)
}

export default async function BookingsPipelinePage() {
  const bookings = await loadBookings()
  return <BookingsPipelineClient initialBookings={bookings} />
}
