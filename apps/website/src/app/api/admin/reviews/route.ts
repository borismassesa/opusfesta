import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";
import { getAuthenticatedUser } from "@/lib/api-auth";

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
    // Authenticate user
    const user = await getAuthenticatedUser();
    if (!user) {
      return NextResponse.json(
        { error: "Authentication required" },
        { status: 401 }
      );
    }

    const supabaseAdmin = getSupabaseAdmin();

    // Check if user is admin
    const { data: userData, error: userError } = await supabaseAdmin
      .from("users")
      .select("role")
      .eq("id", user.id)
      .single();

    if (userError || userData?.role !== "admin") {
      return NextResponse.json(
        { error: "Admin access required" },
        { status: 403 }
      );
    }

    // Get query parameters
    const { searchParams } = new URL(request.url);
    const status = searchParams.get("status") || "pending";
    const page = parseInt(searchParams.get("page") || "1");
    const limit = parseInt(searchParams.get("limit") || "20");
    const offset = (page - 1) * limit;

    // Build query
    let query = supabaseAdmin
      .from("reviews")
      .select(`
        id,
        vendor_id,
        user_id,
        rating,
        title,
        content,
        images,
        event_type,
        event_date,
        verified,
        moderation_status,
        moderation_notes,
        flagged_reason,
        moderated_at,
        moderated_by,
        created_at,
        vendors!inner(business_name, category),
        users!inner(name, email)
      `, { count: "exact" })
      .order("created_at", { ascending: false });

    // Filter by moderation status
    if (status !== "all") {
      query = query.eq("moderation_status", status);
    }

    // Apply pagination
    query = query.range(offset, offset + limit - 1);

    const { data: reviews, error: reviewsError, count } = await query;

    if (reviewsError) {
      console.error("Error fetching reviews:", reviewsError);
      return NextResponse.json(
        { error: "Failed to fetch reviews", details: reviewsError.message },
        { status: 500 }
      );
    }

    // Transform the data
    const transformedReviews = (reviews || []).map((review: any) => ({
      id: review.id,
      vendorId: review.vendor_id,
      vendorName: review.vendors?.business_name,
      vendorCategory: review.vendors?.category,
      userId: review.user_id,
      userName: review.users?.name,
      userEmail: review.users?.email,
      rating: review.rating,
      title: review.title,
      content: review.content,
      images: review.images || [],
      eventType: review.event_type,
      eventDate: review.event_date,
      verified: review.verified,
      moderationStatus: review.moderation_status,
      moderationNotes: review.moderation_notes,
      flaggedReason: review.flagged_reason,
      moderatedAt: review.moderated_at,
      moderatedBy: review.moderated_by,
      createdAt: review.created_at,
    }));

    return NextResponse.json({
      reviews: transformedReviews,
      pagination: {
        page,
        limit,
        total: count || 0,
        totalPages: Math.ceil((count || 0) / limit),
      },
    });
  } catch (error) {
    console.error("Unexpected error fetching reviews:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
