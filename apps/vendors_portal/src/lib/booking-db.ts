import type { Booking, BookingInternalStatus, BookingStage, BookingTimelineEntry, CalendarBooking } from './mock-data'

// All columns returned from vendor_bookings — used in select strings across pages and API routes.
export const BOOKING_SELECT =
  'id, vendor_id, inquiry_id, client_user_id, event_date, start_time, end_time, ' +
  'partner_a, partner_b, phone, whatsapp, email, package_name, location, ' +
  'stage, internal_status, total_value, deposit_percent, deposit_paid, balance_due_date, ' +
  'contract_sent_at, contract_signed, invoice_issued, brief_submitted, slot_held_until, ' +
  'last_message_at, last_message_preview, review_requested, review_received, timeline, ' +
  'cancellation_reason, cancelled_at, created_at, updated_at'

// Shape returned by Supabase (snake_case, nullable fields).
export type DbBookingRow = {
  id: string
  vendor_id: string
  inquiry_id: string | null
  client_user_id: string | null
  event_date: string
  start_time: string
  end_time: string
  partner_a: string
  partner_b: string
  phone: string | null
  whatsapp: string | null
  email: string
  package_name: string
  location: string
  stage: string
  internal_status: string
  total_value: number
  deposit_percent: number
  deposit_paid: boolean
  balance_due_date: string | null
  contract_sent_at: string | null
  contract_signed: boolean
  invoice_issued: boolean
  brief_submitted: boolean
  slot_held_until: string | null
  last_message_at: string | null
  last_message_preview: string | null
  review_requested: boolean
  review_received: boolean
  timeline: unknown
  cancellation_reason: string | null
  cancelled_at: string | null
  created_at: string
  updated_at: string
}

function firstName(name: string): string {
  return name.split(' ')[0]
}

export function mapDbBooking(row: DbBookingRow): Booking {
  return {
    id: row.id,
    date: row.event_date,
    startTime: row.start_time,
    endTime: row.end_time,
    couple: `${firstName(row.partner_a)} & ${firstName(row.partner_b)}`,
    partnerA: row.partner_a,
    partnerB: row.partner_b,
    phone: row.phone ?? '',
    whatsapp: row.whatsapp ?? row.phone ?? '',
    email: row.email,
    avatarUrl: null,
    packageName: row.package_name,
    location: row.location,
    stage: row.stage as BookingStage,
    internalStatus: row.internal_status as BookingInternalStatus,
    totalValue: row.total_value,
    depositPercent: row.deposit_percent,
    depositPaid: row.deposit_paid,
    balanceDueDate: row.balance_due_date,
    contractSentAt: row.contract_sent_at,
    contractSigned: row.contract_signed,
    invoiceIssued: row.invoice_issued,
    briefSubmitted: row.brief_submitted,
    slotHeldUntil: row.slot_held_until,
    leadId: row.inquiry_id,
    lastMessageAt: row.last_message_at,
    lastMessagePreview: row.last_message_preview,
    reviewRequested: row.review_requested,
    reviewReceived: row.review_received,
    timeline: Array.isArray(row.timeline) ? (row.timeline as BookingTimelineEntry[]) : [],
  }
}

// Lighter projection used by the calendar view. Cancelled bookings are excluded.
export function toCalendarBooking(b: Booking): CalendarBooking | null {
  if (b.stage === 'cancelled') return null
  const status: CalendarBooking['status'] =
    b.stage === 'completed' ? 'completed' :
    b.stage === 'confirmed' ? 'confirmed' : 'pending'
  return {
    id: b.id,
    date: b.date,
    startTime: b.startTime,
    endTime: b.endTime,
    couple: b.couple,
    packageName: b.packageName,
    location: b.location,
    status,
  }
}
