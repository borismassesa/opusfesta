import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";
import {
  VendorBySlugResponseSchema,
  type VendorBySlugResponse,
} from "@opusfesta/lib";
import { getAuthenticatedUser } from "@/lib/api-auth";
import { VENDOR_COLUMNS } from "@/lib/vendor-columns";

// Get Supabase admin client for database queries
function getSupabaseAdmin() {
  if (!process.env.NEXT_PUBLIC_SUPABASE_URL || !process.env.SUPABASE_SERVICE_ROLE_KEY) {
    throw new Error("Missing Supabase configuration");
  }

  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL,
    process.env.SUPABASE_SERVICE_ROLE_KEY,
    {
      auth: {
        autoRefreshToken: false,
        persistSession: false,
      },
    }
  );
}

// Helper function to truncate text
function truncateText(text: string | null, maxLength: number = 100): string | null {
  if (!text) return null;
  if (text.length <= maxLength) return text;
  return text.substring(0, maxLength) + "...";
}

function toFiniteNumber(value: unknown, fallback = 0): number {
  const numericValue = Number(value);
  return Number.isFinite(numericValue) ? numericValue : fallback;
}

function normalizeVendorForBySlug(vendor: Record<string, any>, isTeaser: boolean) {
  const statsSource =
    vendor.stats && typeof vendor.stats === "object" ? vendor.stats : {};
  const location =
    vendor.location && typeof vendor.location === "object" ? vendor.location : {};

  return {
    ...vendor,
    id: typeof vendor.id === "string" ? vendor.id : "",
    slug: typeof vendor.slug === "string" ? vendor.slug : "",
    business_name:
      typeof vendor.business_name === "string" ? vendor.business_name : "Vendor",
    category: typeof vendor.category === "string" ? vendor.category : "Other",
    location,
    price_range:
      typeof vendor.price_range === "string" ? vendor.price_range : null,
    verified: Boolean(vendor.verified),
    tier: typeof vendor.tier === "string" ? vendor.tier : "free",
    stats: {
      viewCount: toFiniteNumber(statsSource.viewCount),
      inquiryCount: toFiniteNumber(statsSource.inquiryCount),
      saveCount: toFiniteNumber(statsSource.saveCount),
      averageRating: toFiniteNumber(statsSource.averageRating),
      reviewCount: toFiniteNumber(statsSource.reviewCount),
    },
    cover_image:
      typeof vendor.cover_image === "string" ? vendor.cover_image : null,
    logo: typeof vendor.logo === "string" ? vendor.logo : null,
    bio: typeof vendor.bio === "string" ? vendor.bio : null,
    description:
      typeof vendor.description === "string" ? vendor.description : null,
    created_at:
      typeof vendor.created_at === "string"
        ? vendor.created_at
        : new Date().toISOString(),
    isTeaser,
  };
}

function normalizeSimilarVendor(vendor: Record<string, any>) {
  const statsSource =
    vendor.stats && typeof vendor.stats === "object" ? vendor.stats : {};
  const location =
    vendor.location && typeof vendor.location === "object" ? vendor.location : {};

  return {
    id: typeof vendor.id === "string" ? vendor.id : "",
    slug: typeof vendor.slug === "string" ? vendor.slug : "",
    business_name:
      typeof vendor.business_name === "string" ? vendor.business_name : "Vendor",
    category: typeof vendor.category === "string" ? vendor.category : "Other",
    location,
    price_range:
      typeof vendor.price_range === "string" ? vendor.price_range : null,
    verified: Boolean(vendor.verified),
    tier: typeof vendor.tier === "string" ? vendor.tier : "free",
    stats: {
      viewCount: toFiniteNumber(statsSource.viewCount),
      inquiryCount: toFiniteNumber(statsSource.inquiryCount),
      saveCount: toFiniteNumber(statsSource.saveCount),
      averageRating: toFiniteNumber(statsSource.averageRating),
      reviewCount: toFiniteNumber(statsSource.reviewCount),
    },
    cover_image:
      typeof vendor.cover_image === "string" ? vendor.cover_image : null,
    logo: typeof vendor.logo === "string" ? vendor.logo : null,
    bio: typeof vendor.bio === "string" ? vendor.bio : null,
    description:
      typeof vendor.description === "string" ? vendor.description : null,
    created_at:
      typeof vendor.created_at === "string"
        ? vendor.created_at
        : new Date().toISOString(),
  };
}

// Track vendor view
async function trackVendorView(
  vendorId: string,
  userId: string | null,
  source: string = "api"
): Promise<void> {
  try {
    const supabaseAdmin = getSupabaseAdmin();
    await supabaseAdmin.from("vendor_views").insert({
      vendor_id: vendorId,
      user_id: userId,
      source,
      viewed_at: new Date().toISOString(),
    });
  } catch (error) {
    // Don't fail the request if tracking fails
    console.error("Error tracking vendor view:", error);
  }
}

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ slug: string }> }
) {
  try {
    const { slug } = await params;
    const supabaseAdmin = getSupabaseAdmin();

    // Check if user is authenticated (optional - route works without auth too).
    // Auth providers can throw in some local/public contexts; treat that as guest mode.
    let user = null;
    try {
      user = await getAuthenticatedUser();
    } catch (authError) {
      console.warn("Non-fatal auth lookup failure in vendor by-slug route:", authError);
    }
    const isAuthenticated = !!user;

    // Get vendor from database by slug (exact match first).
    let vendor: Record<string, unknown> | null = null;
    let vendorError: { message: string } | null = null;
    const exactResult = await supabaseAdmin
      .from("vendors")
      .select(VENDOR_COLUMNS)
      .eq("slug", slug)
      .single();
    vendor = exactResult.data as Record<string, unknown> | null;
    vendorError = exactResult.error;

    // Optional fallback: resolve name-based slugs in DB (legacy/shared links).
    if ((vendorError || !vendor) && /^[a-z0-9-]+$/.test(slug)) {
      const { data: fallbackRows } = await supabaseAdmin.rpc("get_vendor_by_slug_fallback", {
        slug_param: slug,
      });
      if (Array.isArray(fallbackRows) && fallbackRows.length > 0) {
        vendor = fallbackRows[0] as Record<string, unknown>;
      }
    }

    if (!vendor) {
      return NextResponse.json(
        { error: "Vendor not found" },
        { status: 404, headers: { "Cache-Control": "private, no-store" } }
      );
    }

    // Track view (fire and forget)
    trackVendorView(String(vendor.id), user?.id || null, "api").catch(console.error);

    // For unauthenticated users, return teaser
    if (!isAuthenticated) {
      const teaserResponse: VendorBySlugResponse = {
        vendor: normalizeVendorForBySlug(
          {
            ...vendor,
            bio: truncateText(typeof vendor.bio === "string" ? vendor.bio : null, 100),
            description: null, // Hide full description
          },
          true
        ),
        isAuthenticated: false,
      };

      const parsedTeaserResponse = VendorBySlugResponseSchema.safeParse(teaserResponse);
      if (!parsedTeaserResponse.success) {
        console.error("Vendor by-slug teaser response contract mismatch:", parsedTeaserResponse.error.flatten());
        return NextResponse.json(
          { error: "Invalid vendor by-slug response contract" },
          { status: 500 }
        );
      }

      return NextResponse.json(parsedTeaserResponse.data, {
        headers: {
          "Cache-Control": "public, s-maxage=300, stale-while-revalidate=600",
          "Vary": "Cookie, Authorization",
        },
      });
    }

    // For authenticated users, return full vendor data
    const [portfolioResult, reviewsResult, similarVendorsResult, awardsResult] = await Promise.all([
      supabaseAdmin
        .from("portfolio")
        .select("*")
        .eq("vendor_id", vendor.id)
        .order("display_order", { ascending: true })
        .order("created_at", { ascending: false }),
      supabaseAdmin.rpc("get_vendor_reviews_with_users", {
        vendor_id_param: vendor.id,
      }),
      supabaseAdmin
        .from("vendors")
        .select(VENDOR_COLUMNS)
        .eq("category", vendor.category)
        .eq("verified", true)
        .neq("id", vendor.id)
        .order("stats->averageRating", { ascending: false })
        .limit(6),
      supabaseAdmin.from("vendors").select("awards").eq("id", vendor.id).single(),
    ]);

    if (portfolioResult.error) {
      console.error("Error loading vendor portfolio in by-slug route:", portfolioResult.error);
    }
    if (reviewsResult.error) {
      console.error("Error loading vendor reviews in by-slug route:", reviewsResult.error);
    }
    if (similarVendorsResult.error) {
      console.error("Error loading similar vendors in by-slug route:", similarVendorsResult.error);
    }
    if (awardsResult.error) {
      console.error("Error loading vendor awards in by-slug route:", awardsResult.error);
    }

    // Map RPC or fallback review rows to contract shape
    const mapReviewRow = (row: Record<string, unknown>): {
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
      user: { name: string; avatar: string | null };
    } => ({
      id: String(row.id ?? ""),
      vendor_id: String(row.vendor_id ?? ""),
      user_id: String(row.user_id ?? ""),
      rating: Number(row.rating) || 0,
      title: row.title != null ? String(row.title) : null,
      content: String(row.content ?? ""),
      images: Array.isArray(row.images) ? (row.images as string[]) : [],
      event_type: row.event_type != null ? String(row.event_type) : null,
      event_date: row.event_date != null ? String(row.event_date) : null,
      verified: Boolean(row.verified),
      helpful: Number(row.helpful) || 0,
      vendor_response: row.vendor_response != null ? String(row.vendor_response) : null,
      vendor_responded_at: row.vendor_responded_at != null ? String(row.vendor_responded_at) : null,
      created_at: row.created_at != null ? String(row.created_at) : "",
      updated_at: row.updated_at != null ? String(row.updated_at) : "",
      user: (() => {
        const u = row.users as { name?: string; avatar?: string | null } | undefined;
        return {
          name: String(row.user_name ?? u?.name ?? "Anonymous"),
          avatar: (row.user_avatar ?? u?.avatar) != null ? String(row.user_avatar ?? u?.avatar) : null,
        };
      })(),
    });

    let reviews: ReturnType<typeof mapReviewRow>[];
    if (!reviewsResult.error && Array.isArray(reviewsResult.data)) {
      reviews = reviewsResult.data.map((row: Record<string, unknown>) => mapReviewRow(row));
    } else {
      // Fallback: RPC failed (e.g. type mismatch varchar vs text); query reviews + users directly
      const { data: fallbackReviews, error: fallbackError } = await supabaseAdmin
        .from("reviews")
        .select("*, users!reviews_user_id_fkey(name, avatar)")
        .eq("vendor_id", vendor.id)
        .eq("verified", true)
        .order("created_at", { ascending: false });

      if (fallbackError) {
        console.error("Error loading vendor reviews (fallback) in by-slug route:", fallbackError);
        reviews = [];
      } else {
        const rows = (fallbackReviews || []).map((r: Record<string, unknown>) => ({
          ...r,
          user_name: (r.users as Record<string, unknown> | null)?.name ?? "Anonymous",
          user_avatar: (r.users as Record<string, unknown> | null)?.avatar ?? null,
        }));
        reviews = rows.map(mapReviewRow);
      }
    }

    const fullResponse: VendorBySlugResponse = {
      vendor: normalizeVendorForBySlug(vendor, false),
      isAuthenticated: true,
      portfolio: portfolioResult.data || [],
      reviews,
      similarVendors: (similarVendorsResult.data || []).map(normalizeSimilarVendor),
      awards: awardsResult.data?.awards || [],
    };

    const parsedFullResponse = VendorBySlugResponseSchema.safeParse(fullResponse);
    if (!parsedFullResponse.success) {
      console.error("Vendor by-slug full response contract mismatch:", parsedFullResponse.error.flatten());
      return NextResponse.json(
        { error: "Invalid vendor by-slug response contract" },
        { status: 500 }
      );
    }

    return NextResponse.json(parsedFullResponse.data, {
      headers: { "Cache-Control": "private, no-store" },
    });
  } catch (error) {
    console.error("Error fetching vendor:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
