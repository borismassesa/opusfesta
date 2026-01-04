import { NextRequest, NextResponse } from "next/server";
import { supabase } from "@/lib/supabaseClient";

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
      return NextResponse.json({
        vendors: [],
        total: 0,
        page,
        limit,
        totalPages: 0,
      });
    }

    // Get total count from first row (all rows have the same total_count)
    const total = data[0]?.total_count || 0;
    const totalPages = Math.ceil(total / limit);

    // Transform the data to match Vendor interface
    const vendors = data.map((row: any) => ({
      id: row.id,
      slug: row.slug,
      business_name: row.business_name,
      category: row.category,
      location: row.location || {},
      price_range: row.price_range,
      verified: row.verified,
      tier: row.tier || 'free',
      stats: row.stats || {
        viewCount: 0,
        inquiryCount: 0,
        saveCount: 0,
        averageRating: 0,
        reviewCount: 0,
      },
      cover_image: row.cover_image,
      logo: row.logo,
      created_at: row.created_at,
    }));

    return NextResponse.json({
      vendors,
      total,
      page,
      limit,
      totalPages,
    });
  } catch (error) {
    console.error("Unexpected error in vendor search:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
