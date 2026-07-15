import type { SupabaseClient } from '@supabase/supabase-js';
import type { BookingStage, VendorBookingRow, VendorBookingTimelineEntry } from '@/types/vendor';

const BOOKING_COLUMNS = `
  id, vendor_id, inquiry_id, event_date, start_time, end_time, partner_a,
  partner_b, phone, whatsapp, email, package_name, location, stage,
  internal_status, total_value, deposit_percent, deposit_paid,
  contract_sent_at, contract_signed, invoice_issued, brief_submitted,
  last_message_at, last_message_preview, review_requested, review_received,
  timeline, cancellation_reason, cancelled_at, created_at
`;

export async function getVendorBookings(
  client: SupabaseClient,
  vendorId: string,
  stage?: BookingStage | 'all'
): Promise<VendorBookingRow[]> {
  let query = client
    .from('vendor_bookings')
    .select(BOOKING_COLUMNS)
    .eq('vendor_id', vendorId)
    .order('event_date', { ascending: true });

  if (stage && stage !== 'all') {
    query = query.eq('stage', stage);
  }

  const { data, error } = await query;
  if (error) throw error;
  return (data ?? []) as VendorBookingRow[];
}

export async function getVendorBooking(client: SupabaseClient, id: string): Promise<VendorBookingRow> {
  const { data, error } = await client.from('vendor_bookings').select(BOOKING_COLUMNS).eq('id', id).single();
  if (error) throw error;
  return data as VendorBookingRow;
}

export async function updateVendorBookingStage(
  client: SupabaseClient,
  id: string,
  stage: BookingStage,
  timelineEntry: VendorBookingTimelineEntry,
  currentTimeline: VendorBookingTimelineEntry[]
): Promise<VendorBookingRow> {
  const { data, error } = await client
    .from('vendor_bookings')
    .update({ stage, timeline: [...currentTimeline, timelineEntry] })
    .eq('id', id)
    .select(BOOKING_COLUMNS)
    .single();

  if (error) throw error;
  return data as VendorBookingRow;
}
