import type { SupabaseClient } from '@supabase/supabase-js';
import type { VendorRow, VendorPackage } from '@/types/vendor';

const MY_VENDOR_COLUMNS = `
  id, user_id, slug, business_name, category, bio, description, logo,
  cover_image, gallery_urls, location, price_range, stats, contact_info,
  social_links, packages, onboarding_status, created_at, updated_at
`;

export type VendorMemberRole = 'owner' | 'manager' | 'staff';

export interface MyVendor {
  vendor: VendorRow;
  myRole: VendorMemberRole;
}

export async function getMyVendor(client: SupabaseClient): Promise<MyVendor | null> {
  // Unlike couple_profiles/wedding_websites, `vendors` SELECT RLS is public
  // (anyone can browse any vendor), so it won't narrow an unfiltered query
  // down to "mine" — we must filter by user_id explicitly. Clerk's id isn't
  // a valid users.id UUID, so resolve the caller's own id via the same
  // function RLS uses (same pattern used for couple_profiles writes in
  // wedding-website.ts) rather than an unfiltered `users` select — the
  // `users` table also has policies exposing other users' rows
  // (message-thread visibility for vendors), so an unfiltered
  // `.select('id').single()` can see more than one row and throw
  // "Cannot coerce the result to a single JSON object".
  const { data: myId, error: meError } = await client.rpc('requesting_user_id');
  if (meError) throw meError;

  const { data, error } = await client
    .from('vendors')
    .select(MY_VENDOR_COLUMNS)
    .eq('user_id', myId)
    .maybeSingle();

  if (error) throw error;
  if (data) return { vendor: data as VendorRow, myRole: 'owner' };

  // Staff/manager accounts have no vendors row of their own — only a
  // vendor_memberships row (RLS lets a user read their own memberships).
  // Take the first active membership; multi-vendor membership isn't a
  // supported product state yet.
  const { data: membership, error: membershipError } = await client
    .from('vendor_memberships')
    .select('vendor_id, role')
    .eq('user_id', myId)
    .eq('status', 'active')
    .order('created_at', { ascending: true })
    .limit(1)
    .maybeSingle();

  if (membershipError) throw membershipError;
  if (!membership) return null;

  const { data: memberVendor, error: memberVendorError } = await client
    .from('vendors')
    .select(MY_VENDOR_COLUMNS)
    .eq('id', membership.vendor_id)
    .maybeSingle();

  if (memberVendorError) throw memberVendorError;
  if (!memberVendor) return null;
  return { vendor: memberVendor as VendorRow, myRole: membership.role as VendorMemberRole };
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
