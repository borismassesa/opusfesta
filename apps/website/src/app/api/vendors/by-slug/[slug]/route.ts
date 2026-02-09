import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";
import {
  VendorBySlugResponseSchema,
  type VendorBySlugResponse,
} from "@opusfesta/lib";
import { getAuthenticatedUser } from "@/lib/api-auth";

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

    // Check if user is authenticated (optional - route works without auth too)
    const user = await getAuthenticatedUser();
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
    trackVendorView(vendor.id, user?.id || null, "api").catch(console.error);

    // For unauthenticated users, return teaser
    if (!isAuthenticated) {
      const teaserResponse: VendorBySlugResponse = {
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
      };

      const parsedTeaserResponse = VendorBySlugResponseSchema.safeParse(teaserResponse);
      if (!parsedTeaserResponse.success) {
        console.error("Vendor by-slug teaser response contract mismatch:", parsedTeaserResponse.error.flatten());
        return NextResponse.json(
          { error: "Invalid vendor by-slug response contract" },
          { status: 500 }
        );
      }

      return NextResponse.json(parsedTeaserResponse.data);
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
        .select("*")
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

    const reviews = (reviewsResult.data || []).map((row: any) => ({
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
    }));

    const fullResponse: VendorBySlugResponse = {
      vendor: {
        ...vendor,
        isTeaser: false,
      },
      isAuthenticated: true,
      portfolio: portfolioResult.data || [],
      reviews,
      similarVendors: similarVendorsResult.data || [],
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

    return NextResponse.json(parsedFullResponse.data);
  } catch (error) {
    console.error("Error fetching vendor:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
