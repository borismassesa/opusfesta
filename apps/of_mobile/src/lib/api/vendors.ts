import { supabase } from '../supabase';
import type { VendorReview, VendorListing, VendorPackageDetail } from '@/types/vendor';

// Row shape returned by the get_vendor_reviews_with_users RPC.
interface VendorReviewRpcRow {
  id: string;
  vendor_id: string;
  rating: number;
  title: string | null;
  content: string | null;
  event_type: string | null;
  created_at: string;
  user_name: string | null;
  user_avatar: string | null;
}

const VENDOR_COLUMNS = `
  id, slug, user_id, business_name, category, subcategories, bio, description,
  logo, cover_image, gallery_urls, location, price_range, verified, tier, stats, contact_info,
  social_links, years_in_business, team_size, services_offered, team,
  created_at, updated_at
`;

export async function getFeaturedVendors(): Promise<VendorListing[]> {
  if (!supabase) return [];
  const { data, error } = await supabase
    .from('vendors')
    .select(VENDOR_COLUMNS)
    .eq('verified', true)
    .order('created_at', { ascending: false })
    .limit(10);

  if (error) throw error;
  return (data ?? []) as VendorListing[];
}

export async function getVendorsByCategory(category: string): Promise<VendorListing[]> {
  if (!supabase) return [];
  const { data, error } = await supabase
    .from('vendors')
    .select(VENDOR_COLUMNS)
    .eq('category', category)
    .order('created_at', { ascending: false });

  if (error) throw error;
  return data ?? [];
}

export async function getVendorById(id: string): Promise<VendorListing | null> {
  if (!supabase) return null;
  const { data, error } = await supabase
    .from('vendors')
    .select(VENDOR_COLUMNS)
    .eq('id', id)
    .single();

  if (error) throw error;
  return data;
}

export async function searchVendors(query: string): Promise<VendorListing[]> {
  if (!supabase) return [];
  const { data, error } = await supabase
    .from('vendors')
    .select(VENDOR_COLUMNS)
    .or(`business_name.ilike.%${query}%,description.ilike.%${query}%`)
    .limit(20);

  if (error) throw error;
  return data ?? [];
}

export async function getVendorReviews(vendorId: string) {
  if (!supabase) return [];
  const { data, error } = await supabase.rpc('get_vendor_reviews_with_users', {
    vendor_id_param: vendorId,
  });

  if (error) throw error;
  return ((data ?? []) as VendorReviewRpcRow[]).map((row): VendorReview => ({
    id: row.id,
    vendor_id: row.vendor_id,
    rating: row.rating,
    title: row.title,
    content: row.content,
    event_type: row.event_type,
    created_at: row.created_at,
    user: {
      name: row.user_name || 'Anonymous',
      avatar: row.user_avatar || null,
    },
  }));
}

export async function getVendorPackages(vendorId: string): Promise<VendorPackageDetail[]> {
  if (!supabase) return [];
  const { data, error } = await supabase
    .from('vendors')
    .select('packages')
    .eq('id', vendorId)
    .single();

  if (error) throw error;
  return data?.packages ?? [];
}

export async function getCategoryCounts() {
  if (!supabase) return {};
  const { data, error } = await supabase
    .from('vendors')
    .select('category')
    .eq('verified', true);

  if (error) throw error;

  const counts: Record<string, number> = {};
  ((data ?? []) as { category: string }[]).forEach((v) => {
    counts[v.category] = (counts[v.category] || 0) + 1;
  });
  return counts;
}
