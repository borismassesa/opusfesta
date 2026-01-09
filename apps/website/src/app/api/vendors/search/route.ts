import { NextRequest, NextResponse } from "next/server";
import { supabase } from "@/lib/supabaseClient";
import { createClient } from "@supabase/supabase-js";

// Get Supabase admin client for authentication
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

// Get authenticated user from request (optional - returns null if not authenticated)
async function getAuthenticatedUser(request: NextRequest): Promise<{ userId: string } | null> {
  const authHeader = request.headers.get("authorization");
  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    return null;
  }

  const token = authHeader.replace("Bearer ", "");
  
  try {
    const supabaseAdmin = getSupabaseAdmin();
    const { data: { user }, error } = await supabaseAdmin.auth.getUser(token);
    
    if (error || !user) {
      return null;
    }

    // Verify user exists in database
    const { data: userData } = await supabaseAdmin
      .from("users")
      .select("id")
      .eq("id", user.id)
      .single();

    return userData ? { userId: user.id } : null;
  } catch (error) {
    console.error("Error getting authenticated user:", error);
    return null;
  }
}

// Helper function to truncate text
function truncateText(text: string | null, maxLength: number = 100): string | null {
  if (!text) return null;
  if (text.length <= maxLength) return text;
  return text.substring(0, maxLength) + "...";
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

    // Check if user is authenticated
    const user = await getAuthenticatedUser(request);
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

    // Transform the data - apply progressive disclosure for unauthenticated users
    const vendors = data.map((row: any) => {
      const baseVendor = {
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
      };

      // For unauthenticated users, return teaser (truncated bio/description)
      if (!isAuthenticated) {
        return {
          ...baseVendor,
          bio: truncateText(row.bio, 100),
          description: null, // Hide full description
          isTeaser: true, // Flag to indicate this is a teaser
        };
      }

      // For authenticated users, return full data
      return {
        ...baseVendor,
        bio: row.bio,
        description: row.description,
        isTeaser: false,
      };
    });

    return NextResponse.json({
      vendors,
      total,
      page,
      limit,
      totalPages,
      isAuthenticated,
    });
  } catch (error) {
    console.error("Unexpected error in vendor search:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
