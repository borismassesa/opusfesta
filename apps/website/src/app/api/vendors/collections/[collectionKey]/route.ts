import { NextRequest, NextResponse } from "next/server";
import { supabase } from "@/lib/supabaseClient";
import {
  VendorCollectionResponseSchema,
  type VendorCollectionResponse,
} from "@opusfesta/lib";

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ collectionKey: string }> }
) {
  try {
    const { collectionKey } = await params;
    const searchParams = request.nextUrl.searchParams;
    const page = parseInt(searchParams.get("page") || "1", 10);
    const limit = parseInt(searchParams.get("limit") || "100", 10);

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

    let query = supabase
      .from("vendors")
      .select("*", { count: "exact" })
      .eq("verified", true);
    let isNewCollection = false;

    // Apply collection-specific filters
    switch (collectionKey) {
      case "deals":
        // Premium tier vendors or vendors with high ratings (considered "deals")
        query = query
          .in("tier", ["premium", "pro"])
          .order("stats->averageRating", { ascending: false })
          .order("created_at", { ascending: false });
        break;

      case "new":
        isNewCollection = true;
        // Recently created vendors (within last 30 days)
        const thirtyDaysAgo = new Date();
        thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
        query = query
          .gte("created_at", thirtyDaysAgo.toISOString())
          .order("created_at", { ascending: false });
        break;

      case "trending":
      case "most-booked":
        // Vendors with highest inquiry count (most booked)
        query = query
          .order("stats->inquiryCount", { ascending: false })
          .order("stats->averageRating", { ascending: false });
        break;

      case "budget":
        // Budget-friendly vendors (lower price ranges)
        query = query
          .in("price_range", ["$", "$$"])
          .order("stats->averageRating", { ascending: false });
        break;

      case "fast-responders":
        // Vendors with high inquiry count relative to response rate
        // For now, we'll use vendors with high inquiry count as a proxy
        query = query
          .order("stats->inquiryCount", { ascending: false })
          .order("stats->averageRating", { ascending: false });
        break;

      case "zanzibar":
        // Vendors located in Zanzibar
        query = query
          .eq("location->>city", "Zanzibar")
          .order("stats->averageRating", { ascending: false });
        break;

      default:
        return NextResponse.json(
          { error: "Invalid collection key" },
          { status: 400 }
        );
    }

    // Apply pagination
    const offset = (page - 1) * limit;
    query = query.range(offset, offset + limit - 1);

    const { data, error, count } = await query;

    if (error) {
      console.error("Collection fetch error:", error);
      return NextResponse.json(
        { error: "Failed to fetch collection", details: error.message },
        { status: 500 }
      );
    }

    let rows = data || [];
    let total = count || 0;

    // If there are no vendors created in the last 30 days, fall back to latest verified vendors.
    if (isNewCollection && rows.length === 0) {
      const { data: fallbackData, error: fallbackError, count: fallbackCount } = await supabase
        .from("vendors")
        .select("*", { count: "exact" })
        .eq("verified", true)
        .order("created_at", { ascending: false })
        .range(offset, offset + limit - 1);

      if (!fallbackError && fallbackData) {
        rows = fallbackData;
        total = fallbackCount || fallbackData.length;
      }
    }

    if (rows.length === 0) {
      const emptyResponse: VendorCollectionResponse = {
        vendors: [],
        total: 0,
        page,
        limit,
        totalPages: 0,
      };

      const parsedEmptyResponse = VendorCollectionResponseSchema.safeParse(emptyResponse);
      if (!parsedEmptyResponse.success) {
        console.error("Vendor collection response contract mismatch:", parsedEmptyResponse.error.flatten());
        return NextResponse.json(
          { error: "Invalid vendor collection response contract" },
          { status: 500 }
        );
      }

      return NextResponse.json(parsedEmptyResponse.data);
    }

    const totalPages = Math.ceil(total / limit);

    // Transform the data to match VendorCollectionItem interface
    const vendors = rows.map((row: any) => {
      // Handle location - it's stored as JSONB
      const location = typeof row.location === 'string' 
        ? JSON.parse(row.location) 
        : row.location || {};
      const city = location?.city || "Unknown";
      
      // Handle stats - it's stored as JSONB
      const stats = typeof row.stats === 'string'
        ? JSON.parse(row.stats)
        : row.stats || {};
      
      return {
        id: row.id,
        name: row.business_name,
        category: row.category,
        location: city,
        rating: stats.averageRating || 0,
        reviews: stats.reviewCount || 0,
        image: row.cover_image || row.logo || null,
        slug: row.slug,
      };
    });

    const responsePayload: VendorCollectionResponse = {
      vendors,
      total,
      page,
      limit,
      totalPages,
    };

    const parsedResponse = VendorCollectionResponseSchema.safeParse(responsePayload);
    if (!parsedResponse.success) {
      console.error("Vendor collection response contract mismatch:", parsedResponse.error.flatten());
      return NextResponse.json(
        { error: "Invalid vendor collection response contract" },
        { status: 500 }
      );
    }

    return NextResponse.json(parsedResponse.data);
  } catch (error) {
    console.error("Unexpected error in collection fetch:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
