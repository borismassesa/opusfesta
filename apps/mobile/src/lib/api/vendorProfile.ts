import type { SupabaseClient } from '@supabase/supabase-js';
import type { VendorRow, VendorPackage } from '@/types/vendor';

const MY_VENDOR_COLUMNS = `
  id, user_id, slug, business_name, category, bio, description, logo,
  cover_image, gallery_urls, location, price_range, stats, contact_info,
  social_links, packages, onboarding_status, created_at, updated_at
`;

export async function getMyVendor(client: SupabaseClient): Promise<VendorRow | null> {
  // Unlike couple_profiles/wedding_websites, `vendors` SELECT RLS is public
  // (anyone can browse any vendor), so it won't narrow an unfiltered query
  // down to "mine" — we must filter by user_id explicitly. Clerk's id isn't
  // a valid users.id UUID, so look up the caller's own row first (same
  // pattern as createWeddingWebsite in wedding-website.ts).
  const { data: me, error: meError } = await client.from('users').select('id').single();
  if (meError) throw meError;

  const { data, error } = await client
    .from('vendors')
    .select(MY_VENDOR_COLUMNS)
    .eq('user_id', me.id)
    .maybeSingle();

  if (error) throw error;
  return data as VendorRow | null;
}

export async function getVendorDashboardStats(client: SupabaseClient, vendorId: string) {
  const [{ data: vendor, error: vendorError }, { data: inquiries, error: inquiriesError }, { data: bookings, error: bookingsError }] =
    await Promise.all([
      client.from('vendors').select('stats').eq('id', vendorId).single(),
      client.from('inquiries').select('id, status').eq('vendor_id', vendorId),
      client
        .from('vendor_bookings')
        .select('id, event_date, stage')
        .eq('vendor_id', vendorId)
        .order('event_date', { ascending: true }),
    ]);

  if (vendorError) throw vendorError;
  if (inquiriesError) throw inquiriesError;
  if (bookingsError) throw bookingsError;

  const today = new Date().toISOString().slice(0, 10);
  return {
    stats: vendor?.stats ?? {},
    pendingLeadCount: (inquiries ?? []).filter((i) => i.status === 'pending').length,
    totalLeadCount: (inquiries ?? []).length,
    upcomingBookings: (bookings ?? []).filter((b) => b.event_date >= today).slice(0, 3),
  };
}

export async function updateMyVendor(
  client: SupabaseClient,
  vendorId: string,
  patch: Partial<
    Pick<
      VendorRow,
      'business_name' | 'bio' | 'description' | 'logo' | 'cover_image' | 'gallery_urls' | 'contact_info' | 'social_links'
    >
  >
): Promise<VendorRow> {
  const { data, error } = await client
    .from('vendors')
    .update(patch)
    .eq('id', vendorId)
    .select(MY_VENDOR_COLUMNS)
    .single();

  if (error) throw error;
  return data as VendorRow;
}

export async function updateVendorPackages(
  client: SupabaseClient,
  vendorId: string,
  packages: VendorPackage[]
): Promise<VendorRow> {
  const { data, error } = await client
    .from('vendors')
    .update({ packages })
    .eq('id', vendorId)
    .select(MY_VENDOR_COLUMNS)
    .single();

  if (error) throw error;
  return data as VendorRow;
}
