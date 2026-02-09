import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";
import { getAuthenticatedUser } from "@/lib/api-auth";
import {
  VendorSavedResponseSchema,
  type VendorSavedResponse,
} from "@opusfesta/lib";

// Mark route as dynamic to prevent static analysis during build
export const dynamic = 'force-dynamic';
export const runtime = 'nodejs';

// Lazy initialization of Supabase admin client
function getSupabaseAdmin() {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

  if (!supabaseUrl || !serviceRoleKey) {
    throw new Error("Missing required Supabase environment variables");
  }

  return createClient(supabaseUrl, serviceRoleKey, {
    auth: {
      autoRefreshToken: false,
      persistSession: false,
    },
  });
}

export async function GET(request: NextRequest) {
  try {
    const supabaseAdmin = getSupabaseAdmin();

    // Authenticate user
    const user = await getAuthenticatedUser();
    if (!user) {
      return NextResponse.json(
        { error: "Authentication required" },
        { status: 401 }
      );
    }

    // Get saved vendors with vendor details
    const { data: savedVendors, error: savedError } = await supabaseAdmin
      .from("saved_vendors")
      .select(`
        id,
        vendor_id,
        status,
        created_at,
        vendors (
          id,
          slug,
          business_name,
          category,
          location,
          price_range,
          verified,
          stats,
          cover_image,
          logo,
          created_at
        )
      `)
      .eq("user_id", user.id)
      .eq("status", "saved")
      .order("created_at", { ascending: false });

    if (savedError) {
      console.error("Error fetching saved vendors:", savedError);
      return NextResponse.json(
        { error: "Failed to fetch saved vendors" },
        { status: 500 }
      );
    }

    // Transform the data
    const vendors = (savedVendors || [])
      .map((item: any) => item.vendors)
      .filter(Boolean)
      .map((vendor: any) => ({
        id: vendor.id,
        slug: vendor.slug,
        business_name: vendor.business_name,
        category: vendor.category,
        location: vendor.location || {},
        price_range: vendor.price_range,
        verified: vendor.verified,
        stats: vendor.stats || {
          viewCount: 0,
          inquiryCount: 0,
          saveCount: 0,
          averageRating: 0,
          reviewCount: 0,
        },
        cover_image: vendor.cover_image,
        logo: vendor.logo,
        created_at: vendor.created_at,
      }));

    const responsePayload: VendorSavedResponse = {
      vendors,
      count: vendors.length,
    };

    const parsedResponse = VendorSavedResponseSchema.safeParse(responsePayload);
    if (!parsedResponse.success) {
      console.error("Saved vendors response contract mismatch:", parsedResponse.error.flatten());
      return NextResponse.json(
        { error: "Invalid saved vendors response contract" },
        { status: 500 }
      );
    }

    return NextResponse.json(parsedResponse.data);
  } catch (error) {
    console.error("Unexpected error fetching saved vendors:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
