import { supabase } from "@/lib/supabaseClient";

export interface Vendor {
  id: string;
  slug: string;
  user_id: string;
  business_name: string;
  category: string;
  subcategories: string[];
  bio: string | null;
  description: string | null;
  logo: string | null;
  cover_image: string | null;
  location: {
    city?: string;
    country?: string;
    address?: string;
    coordinates?: {
      lat: number;
      lng: number;
    };
  };
  price_range: string | null;
  verified: boolean;
  tier: string;
  stats: {
    viewCount: number;
    inquiryCount: number;
    saveCount: number;
    averageRating: number;
    reviewCount: number;
  };
  contact_info: {
    email?: string;
    phone?: string;
    website?: string;
  };
  social_links: {
    instagram?: string;
    facebook?: string;
    twitter?: string;
    tiktok?: string;
  };
  years_in_business: number | null;
  team_size: number | null;
  services_offered: string[];
  created_at: string;
  updated_at: string;
}

export interface PortfolioItem {
  id: string;
  vendor_id: string;
  title: string;
  images: string[];
  description: string | null;
  event_type: string | null;
  event_date: string | null;
  featured: boolean;
  display_order: number;
  created_at: string;
  updated_at: string;
}

export interface Review {
  id: string;
  vendor_id: string;
  user_id: string;
  rating: number;
  title: string | null;
  content: string;
  images: string[];
  event_type: string | null;
  event_date: string | null;
  verified: boolean;
  helpful: number;
  vendor_response: string | null;
  vendor_responded_at: string | null;
  created_at: string;
  updated_at: string;
  user: {
    name: string;
    avatar: string | null;
  };
}

export async function getVendorBySlug(slug: string): Promise<Vendor | null> {
  const { data, error } = await supabase
    .from("vendors")
    .select("*")
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
  const { data, error } = await supabase
    .from("reviews")
    .select("*")
    .eq("vendor_id", vendorId)
    .eq("verified", true)
    .order("created_at", { ascending: false });

  if (error || !data) {
    return [];
  }

  // Fetch user data for each review
  const reviewsWithUsers = await Promise.all(
    data.map(async (review) => {
      const { data: userData } = await supabase
        .from("users")
        .select("name, avatar")
        .eq("id", review.user_id)
        .single();

      return {
        ...review,
        user: {
          name: userData?.name || "Anonymous",
          avatar: userData?.avatar || null,
        },
      };
    })
  );

  return reviewsWithUsers as Review[];
}

export async function getSimilarVendors(
  category: string,
  excludeId: string,
  limit: number = 6
): Promise<Vendor[]> {
  const { data, error } = await supabase
    .from("vendors")
    .select("*")
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
  // Get current stats
  const { data } = await supabase
    .from("vendors")
    .select("stats")
    .eq("id", vendorId)
    .single();

  if (data?.stats) {
    const currentCount = (data.stats as any).viewCount || 0;
    await supabase
      .from("vendors")
      .update({
        stats: {
          ...(data.stats as any),
          viewCount: currentCount + 1,
        },
      })
      .eq("id", vendorId);
  }
}

