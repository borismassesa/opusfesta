import type { SupabaseClient } from '@supabase/supabase-js';

export async function getMyBookings(client: SupabaseClient) {
  const { data, error } = await client
    .from('bookings')
    .select(`
      *,
      vendors:vendor_id (id, business_name, logo, category),
      events:event_id (id, name, date)
    `)
    .order('created_at', { ascending: false });

  if (error) throw error;
  return data ?? [];
}

export async function getBookingById(client: SupabaseClient, id: string) {
  const { data, error } = await client
    .from('bookings')
    .select(`
      *,
      vendors:vendor_id (id, business_name, logo, category, contact_info),
      events:event_id (id, name, date, location)
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
    event_id?: string;
    event_date: string;
    guest_count: number;
    budget_range?: string;
    message?: string;
  }
) {
  const { data, error } = await client
    .from('bookings')
    .insert({
      vendor_id: payload.vendor_id,
      event_id: payload.event_id,
      status: 'INQUIRY',
      notes: payload.message,
      metadata: {
        event_date: payload.event_date,
        guest_count: payload.guest_count,
        budget_range: payload.budget_range,
      },
    })
    .select()
    .single();

  if (error) throw error;
  return data;
}
