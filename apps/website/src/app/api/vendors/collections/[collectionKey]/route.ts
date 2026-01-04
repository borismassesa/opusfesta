import { NextRequest, NextResponse } from "next/server";
import { supabase } from "@/lib/supabaseClient";

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

    if (!data || data.length === 0) {
      return NextResponse.json({
        vendors: [],
        total: 0,
        page,
        limit,
        totalPages: 0,
      });
    }

    const total = count || 0;
    const totalPages = Math.ceil(total / limit);

    // Transform the data to match VendorCollectionItem interface
    const vendors = data.map((row: any) => {
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

    return NextResponse.json({
      vendors,
      total,
      page,
      limit,
      totalPages,
    });
  } catch (error) {
    console.error("Unexpected error in collection fetch:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
