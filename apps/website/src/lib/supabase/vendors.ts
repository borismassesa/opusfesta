import { supabase } from "@/lib/supabaseClient";
import { VENDOR_COLUMNS } from "@/lib/vendor-columns";
import type {
  VendorRecord,
  VendorPortfolioItem,
  VendorReviewRecord,
  VendorAwardRecord,
} from "@opusfesta/lib";

export type Vendor = VendorRecord;
export type PortfolioItem = VendorPortfolioItem;
export type Review = VendorReviewRecord;
export type VendorAward = VendorAwardRecord;

export async function getVendorBySlug(slug: string): Promise<Vendor | null> {
  const { data, error } = await supabase
    .from("vendors")
    .select(VENDOR_COLUMNS)
    .eq("slug", slug)
    .single();

  if (error || !data) {
    return null;
  }
  return data as Vendor;
}

export async function getVendorPortfolio(
  vendorId: string
): Promise<PortfolioItem[]> {
  const { data, error } = await supabase
    .from("portfolio")
    .select("*")
    .eq("vendor_id", vendorId)
    .order("display_order", { ascending: true })
    .order("created_at", { ascending: false });

  if (error || !data) {
    return [];
  }

  return data as PortfolioItem[];
}

export async function getVendorReviews(vendorId: string): Promise<Review[]> {
  // Use RPC function to get reviews with user data in a single query (fixes N+1 issue)
  const { data, error } = await supabase.rpc("get_vendor_reviews_with_users", {
    vendor_id_param: vendorId,
  });

  if (error || !data) {
    return [];
  }

  // Transform the RPC result to match the Review interface
  return data.map((row: any) => ({
    id: row.id,
    vendor_id: row.vendor_id,
    user_id: row.user_id,
    rating: row.rating,
    title: row.title,
    content: row.content,
    images: row.images || [],
    event_type: row.event_type,
    event_date: row.event_date,
    verified: row.verified,
    helpful: row.helpful,
    vendor_response: row.vendor_response,
    vendor_responded_at: row.vendor_responded_at,
    created_at: row.created_at,
    updated_at: row.updated_at,
    user: {
      name: row.user_name || "Anonymous",
      avatar: row.user_avatar || null,
    },
  })) as Review[];
}

export async function getSimilarVendors(
  category: string,
  excludeId: string,
  limit: number = 6
): Promise<Vendor[]> {
  const { data, error } = await supabase
    .from("vendors")
    .select(VENDOR_COLUMNS)
    .eq("category", category)
    .eq("verified", true)
    .neq("id", excludeId)
    .order("stats->averageRating", { ascending: false })
    .limit(limit);

  if (error || !data) {
    return [];
  }

  return data as Vendor[];
}

export async function incrementVendorViewCount(vendorId: string): Promise<void> {
  // Use atomic increment function to avoid race conditions
  await supabase.rpc("increment_vendor_view_count", {
    vendor_id_param: vendorId,
  });
}

export async function getVendorAwards(vendorId: string): Promise<VendorAward[]> {
  const { data, error } = await supabase
    .from('vendors')
    .select('awards')
    .eq('id', vendorId)
    .single();

  if (error || !data || !data.awards) {
    return [];
  }

  return data.awards as VendorAward[];
}
