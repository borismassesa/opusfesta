import { NextRequest, NextResponse } from "next/server";
import { supabase } from "@/lib/supabaseClient";
import {
  VendorSearchResponseSchema,
  type VendorSearchResponse,
} from "@opusfesta/lib";
import { getAuthenticatedUser } from "@/lib/api-auth";

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

function normalizeStats(stats: unknown): {
  viewCount: number;
  inquiryCount: number;
  saveCount: number;
  averageRating: number;
  reviewCount: number;
} {
  const s = stats && typeof stats === "object" ? (stats as Record<string, unknown>) : {};
  return {
    viewCount: toFiniteNumber(s.viewCount),
    inquiryCount: toFiniteNumber(s.inquiryCount),
    saveCount: toFiniteNumber(s.saveCount),
    averageRating: toFiniteNumber(s.averageRating),
    reviewCount: toFiniteNumber(s.reviewCount),
  };
}

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    
    // Extract query parameters
    const q = searchParams.get("q") || null;
    const category = searchParams.get("category") || null;
    const location = searchParams.get("location") || null;
    const priceRange = searchParams.get("priceRange") || null;
    const verified = searchParams.get("verified") === "true" ? true : null;
    const sortBy = searchParams.get("sort") || "recommended";
    const page = parseInt(searchParams.get("page") || "1", 10);
    const limit = parseInt(searchParams.get("limit") || "20", 10);

    // Check if user is authenticated (optional - route works without auth too).
    // Auth can throw in some contexts; treat failure as guest.
    let user = null;
    try {
      user = await getAuthenticatedUser();
    } catch (authError) {
      console.warn("Non-fatal auth lookup failure in vendor search route:", authError);
    }
    const isAuthenticated = !!user;

    // Validate pagination
    if (page < 1) {
      return NextResponse.json(
        { error: "Page must be greater than 0" },
        { status: 400 }
      );
    }

    if (limit < 1 || limit > 100) {
      return NextResponse.json(
        { error: "Limit must be between 1 and 100" },
        { status: 400 }
      );
    }

    // Call the search RPC function
    const { data, error } = await supabase.rpc("search_vendors", {
      search_query: q,
      category_filter: category,
      location_filter: location,
      price_range_filter: priceRange,
      verified_filter: verified,
      sort_by: sortBy,
      page_number: page,
      page_size: limit,
    });

    if (error) {
      console.error("Search error:", error);
      return NextResponse.json(
        { error: "Failed to search vendors", details: error.message },
        { status: 500 }
      );
    }

    if (!data || data.length === 0) {
      const emptyResponse: VendorSearchResponse = {
        vendors: [],
        total: 0,
        page,
        limit,
        totalPages: 0,
        isAuthenticated,
      };

      const parsedEmptyResponse = VendorSearchResponseSchema.safeParse(emptyResponse);
      if (!parsedEmptyResponse.success) {
        console.error("Vendor search response contract mismatch:", parsedEmptyResponse.error.flatten());
        return NextResponse.json(
          { error: "Invalid vendor search response contract" },
          { status: 500 }
        );
      }

      return NextResponse.json(parsedEmptyResponse.data, {
        headers: {
          "Cache-Control": "public, s-maxage=60, stale-while-revalidate=300",
          "Vary": "Cookie, Authorization",
        },
      });
    }

    // Get total count from first row (all rows have the same total_count)
    const total = Number(data[0]?.total_count) || 0;
    const totalPages = Math.ceil(total / limit);

    // Transform and normalize the data - apply progressive disclosure for unauthenticated users
    const vendors = data.map((row: Record<string, unknown>) => {
      const location =
        row.location && typeof row.location === "object" ? row.location : {};
      const baseVendor = {
        id: String(row.id ?? ""),
        slug: String(row.slug ?? ""),
        business_name: String(row.business_name ?? ""),
        category: String(row.category ?? ""),
        location,
        price_range: row.price_range != null ? String(row.price_range) : null,
        verified: Boolean(row.verified),
        tier: String(row.tier ?? "free"),
        stats: normalizeStats(row.stats),
        cover_image: row.cover_image != null ? String(row.cover_image) : null,
        logo: row.logo != null ? String(row.logo) : null,
        created_at: (() => {
          if (row.created_at == null) return new Date().toISOString();
          const date = new Date(row.created_at as string | number | Date);
          return Number.isFinite(date.getTime()) ? date.toISOString() : new Date().toISOString();
        })(),
      };

      const bioRaw = row.bio != null ? String(row.bio) : null;
      const descriptionRaw =
        row.description != null ? String(row.description) : null;

      // For unauthenticated users, return teaser (truncated bio/description)
      if (!isAuthenticated) {
        return {
          ...baseVendor,
          bio: truncateText(bioRaw, 100),
          description: null,
          isTeaser: true,
        };
      }

      // For authenticated users, return full data
      return {
        ...baseVendor,
        bio: bioRaw,
        description: descriptionRaw,
        isTeaser: false,
      };
    });

    const responsePayload: VendorSearchResponse = {
      vendors,
      total,
      page,
      limit,
      totalPages,
      isAuthenticated,
    };

    const parsedResponse = VendorSearchResponseSchema.safeParse(responsePayload);
    if (!parsedResponse.success) {
      console.error("Vendor search response contract mismatch:", parsedResponse.error.flatten());
      return NextResponse.json(
        { error: "Invalid vendor search response contract" },
        { status: 500 }
      );
    }

    return NextResponse.json(parsedResponse.data, {
      headers: {
        "Cache-Control": "public, s-maxage=60, stale-while-revalidate=300",
        "Vary": "Cookie, Authorization",
      },
    });
  } catch (error) {
    console.error("Unexpected error in vendor search:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
