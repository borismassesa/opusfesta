import { getCurrentVendor } from '@/lib/vendor'
import { createClerkSupabaseServerClient } from '@/lib/supabase'
import { BOOKING_SELECT, mapDbBooking, toCalendarBooking, type DbBookingRow } from '@/lib/booking-db'
import { calendarBookings as mockCalendarBookings } from '@/lib/mock-data'
import type { CalendarBooking } from '@/lib/mock-data'
import BookingsCalendarClient from './BookingsCalendarClient'

async function loadCalendarBookings(): Promise<CalendarBooking[]> {
  const state = await getCurrentVendor()

  if (state.kind === 'no-env') {
    return mockCalendarBookings
  }
  if (state.kind !== 'live') {
    return []
  }

  const supabase = await createClerkSupabaseServerClient()
  const { data, error } = await supabase
    .from('vendor_bookings')
    .select(BOOKING_SELECT)
    .eq('vendor_id', state.vendor.id)
    .neq('stage', 'cancelled')
    .order('event_date', { ascending: true })
    .returns<DbBookingRow[]>()

  if (error) {
    console.error('[calendar page] query failed', error)
    return []
  }

  return (data ?? []).flatMap((row) => {
    const booking = mapDbBooking(row)
    const cal = toCalendarBooking(booking)
    return cal ? [cal] : []
  })
}

export default async function BookingsCalendarPage() {
  const calendarBookings = await loadCalendarBookings()
  return <BookingsCalendarClient initialCalendarBookings={calendarBookings} />
}
