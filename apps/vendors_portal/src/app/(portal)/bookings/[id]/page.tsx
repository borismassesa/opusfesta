import { notFound } from 'next/navigation'
import { getCurrentVendor } from '@/lib/vendor'
import { createClerkSupabaseServerClient } from '@/lib/supabase'
import { BOOKING_SELECT, mapDbBooking, type DbBookingRow } from '@/lib/booking-db'
import { bookings as mockBookings } from '@/lib/mock-data'
import BookingDetailClient from './BookingDetailClient'

export default async function BookingDetailPage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const { id } = await params
  const state = await getCurrentVendor()

  if (state.kind === 'no-env') {
    const booking = mockBookings.find((b) => b.id === id)
    if (!booking) notFound()
    return <BookingDetailClient booking={booking} />
  }

  if (state.kind !== 'live') {
    notFound()
  }

  const supabase = await createClerkSupabaseServerClient()
  const { data, error } = await supabase
    .from('vendor_bookings')
    .select(BOOKING_SELECT)
    .eq('id', id)
    .eq('vendor_id', state.vendor.id)
    .maybeSingle<DbBookingRow>()

  if (error) {
    console.error('[bookings page] detail query failed', error)
    notFound()
  }
  if (!data) notFound()

  return <BookingDetailClient booking={mapDbBooking(data)} />
}
