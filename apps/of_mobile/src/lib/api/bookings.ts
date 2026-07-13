import type { SupabaseClient } from '@supabase/supabase-js';

// `vendor_bookings` is a vendor-side pipeline table — its RLS only grants
// access to the owning vendor, not the couple. A couple's confirmed
// relationship with a vendor lives in `saved_vendors` (status = 'booked'),
// which is RLS-scoped to the requesting user.
export async function getMyBookings(client: SupabaseClient) {
  const { data, error } = await client
    .from('saved_vendors')
    .select(`
      *,
      vendors:vendor_id (id, business_name, logo, category)
    `)
    .eq('status', 'booked')
    .order('created_at', { ascending: false });

  if (error) throw error;
  return data ?? [];
}

export async function getBookingById(client: SupabaseClient, id: string) {
  const { data, error } = await client
    .from('saved_vendors')
    .select(`
      *,
      vendors:vendor_id (id, business_name, logo, category, contact_info)
    `)
    .eq('id', id)
    .single();

  if (error) throw error;
  return data;
}

export async function createBookingInquiry(
  client: SupabaseClient,
  payload: {
    vendor_id: string;
    name: string;
    email: string;
    event_date: string;
    guest_count: number;
    budget_range?: string;
    message?: string;
  }
) {
  const { data, error } = await client
    .from('inquiries')
    .insert({
      vendor_id: payload.vendor_id,
      name: payload.name,
      email: payload.email,
      event_type: 'wedding',
      event_date: payload.event_date,
      guest_count: payload.guest_count,
      budget: payload.budget_range,
      message: payload.message ?? '',
      status: 'pending',
    })
    .select()
    .single();

  if (error) throw error;
  return data;
}
