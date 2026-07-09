import { notFound } from 'next/navigation'
import { getCurrentVendor } from '@/lib/vendor'
import { createClerkSupabaseServerClient } from '@/lib/supabase'
import { BOOKING_SELECT, mapDbBooking, type DbBookingRow } from '@/lib/booking-db'
import { bookings as mockBookings } from '@/lib/mock-data'
import { getLocale } from '@/lib/cms/locale'
import { loadPortalUiStrings } from '@/lib/cms/portal-ui'
import { PortalUIStringsProvider } from '@/components/providers/PortalUIStringsProvider'
import BookingDetailClient from './BookingDetailClient'

export default async function BookingDetailPage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const { id } = await params
  const state = await getCurrentVendor()
  const locale = await getLocale()
  const bookingsStrings = await loadPortalUiStrings('bookings', locale)

  if (state.kind === 'no-env') {
    const booking = mockBookings.find((b) => b.id === id)
    if (!booking) notFound()
    return (
      <PortalUIStringsProvider bundles={{ bookings: bookingsStrings }}>
        <BookingDetailClient booking={booking} />
      </PortalUIStringsProvider>
    )
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

  return (
    <PortalUIStringsProvider bundles={{ bookings: bookingsStrings }}>
      <BookingDetailClient booking={mapDbBooking(data)} />
    </PortalUIStringsProvider>
  )
}
