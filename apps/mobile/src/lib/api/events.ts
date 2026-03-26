import type { SupabaseClient } from '@supabase/supabase-js';

export async function getMyEvents(client: SupabaseClient) {
  const { data, error } = await client
    .from('events')
    .select('*')
    .eq('is_active', true)
    .order('date', { ascending: true });

  if (error) throw error;
  return data ?? [];
}

export async function getEventById(client: SupabaseClient, id: string) {
  const { data, error } = await client
    .from('events')
    .select('*')
    .eq('id', id)
    .single();

  if (error) throw error;
  return data;
}

export async function getDashboardData(client: SupabaseClient) {
  const [eventsRes, bookingsRes] = await Promise.all([
    client
      .from('events')
      .select('*')
      .eq('is_active', true)
      .order('date', { ascending: true })
      .limit(1),
    client
      .from('bookings')
      .select(`
        *,
        vendors:vendor_id (id, business_name, logo, category)
      `)
      .in('status', ['ACCEPTED', 'DEPOSIT_PAID', 'COMPLETED'])
      .order('created_at', { ascending: false }),
  ]);

  if (eventsRes.error) throw eventsRes.error;
  if (bookingsRes.error) throw bookingsRes.error;

  return {
    event: eventsRes.data?.[0] ?? null,
    bookings: bookingsRes.data ?? [],
  };
}
