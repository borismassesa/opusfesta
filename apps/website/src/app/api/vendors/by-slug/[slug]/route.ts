import { NextRequest, NextResponse } from "next/server";
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

// Get authenticated user from request (optional)
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

    // Check if user is authenticated
    const user = await getAuthenticatedUser(request);
    const isAuthenticated = !!user;

    // Get vendor from database
    const { data: vendor, error: vendorError } = await supabaseAdmin
      .from("vendors")
      .select("*")
      .eq("slug", slug)
      .single();

    if (vendorError || !vendor) {
      return NextResponse.json(
        { error: "Vendor not found" },
        { status: 404 }
      );
    }

    // Track view (fire and forget)
    trackVendorView(vendor.id, user?.userId || null, "api").catch(console.error);

    // For unauthenticated users, return teaser
    if (!isAuthenticated) {
      return NextResponse.json({
        vendor: {
          id: vendor.id,
          slug: vendor.slug,
          business_name: vendor.business_name,
          category: vendor.category,
          location: vendor.location || {},
          price_range: vendor.price_range,
          verified: vendor.verified,
          tier: vendor.tier || 'free',
          stats: vendor.stats || {
            viewCount: 0,
            inquiryCount: 0,
            saveCount: 0,
            averageRating: 0,
            reviewCount: 0,
          },
          cover_image: vendor.cover_image,
          logo: vendor.logo,
          bio: truncateText(vendor.bio, 100),
          description: null, // Hide full description
          created_at: vendor.created_at,
          isTeaser: true,
        },
        isAuthenticated: false,
      });
    }

    // For authenticated users, return full vendor data
    return NextResponse.json({
      vendor: {
        ...vendor,
        isTeaser: false,
      },
      isAuthenticated: true,
    });
  } catch (error) {
    console.error("Error fetching vendor:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
