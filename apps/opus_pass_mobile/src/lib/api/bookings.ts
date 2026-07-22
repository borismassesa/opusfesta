import type { SupabaseClient } from '@supabase/supabase-js';
import type { InquiryRow } from '@/types/vendor';

export interface BookingInquiryPayload {
  vendorId: string;
  userId: string;
  name: string;
  email: string;
  phone?: string;
  eventDate: string;
  guestCount: number;
  budget?: string;
  message: string;
}

/**
 * Creates the couple's quote request.
 *
 * `user_id` is required, not optional: the SELECT policy on `inquiries` keys on
 * it, and the create_message_thread_from_inquiry() trigger
 * (023_auto_create_message_thread_on_inquiry.sql) no-ops when it is NULL. Omit
 * it and the request succeeds but the couple can neither see the inquiry nor
 * get the chat thread it is supposed to seed — the bug of_mobile's
 * createBookingInquiry still has.
 */
export async function createBookingInquiry(
  client: SupabaseClient,
  payload: BookingInquiryPayload,
): Promise<InquiryRow> {
  const { data, error } = await client
    .from('inquiries')
    .insert({
      vendor_id: payload.vendorId,
      user_id: payload.userId,
      name: payload.name,
      email: payload.email,
      phone: payload.phone ?? null,
      event_type: 'wedding',
      event_date: payload.eventDate,
      guest_count: payload.guestCount,
      budget: payload.budget ?? null,
      message: payload.message,
      status: 'pending',
    })
    .select()
    .single();

  if (error) throw error;
  return data as InquiryRow;
}
