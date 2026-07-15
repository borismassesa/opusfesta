import type { SupabaseClient } from '@supabase/supabase-js';
import type { CoupleProfile } from '@/types/couple';

// There is no standalone `events` table — a couple's wedding is represented
// by their single `couple_profiles` row (one per user, enforced by a unique
// constraint on user_id). We normalize it to `name`/`date`/`location` so
// existing callers don't need to know about the underlying column names.
function toEventShape(profile: CoupleProfile | null) {
  if (!profile) return null;
  const name = [profile.partner1_name, profile.partner2_name].filter(Boolean).join(' & ') || null;
  const location = [profile.city, profile.region].filter(Boolean).join(', ') || null;
  return { ...profile, name, date: profile.wedding_date, location };
}

export async function getMyEvents(client: SupabaseClient) {
  const { data, error } = await client
    .from('couple_profiles')
    .select('*')
    .maybeSingle();

  if (error) throw error;
  const event = toEventShape(data);
  return event ? [event] : [];
}

export async function getEventById(client: SupabaseClient, id: string) {
  const { data, error } = await client
    .from('couple_profiles')
    .select('*')
    .eq('id', id)
    .single();

  if (error) throw error;
  return toEventShape(data);
}

export interface CoupleBooking {
  id: string;
  status: string | null;
  created_at: string;
  vendors: { id: string; business_name: string; logo: string | null; category: string } | null;
}

export async function getDashboardData(client: SupabaseClient) {
  const [profileRes, bookingsRes] = await Promise.all([
    client
      .from('couple_profiles')
      .select('*')
      .maybeSingle(),
    // `vendor_bookings` RLS only grants access to the owning vendor, not the
    // couple — a couple's booked vendors live in `saved_vendors` instead.
    client
      .from('saved_vendors')
      .select(`
        *,
        vendors:vendor_id (id, business_name, logo, category)
      `)
      .eq('status', 'booked')
      .order('created_at', { ascending: false }),
  ]);

  if (profileRes.error) throw profileRes.error;
  if (bookingsRes.error) throw bookingsRes.error;

  return {
    event: toEventShape(profileRes.data),
    bookings: (bookingsRes.data ?? []) as unknown as CoupleBooking[],
  };
}
