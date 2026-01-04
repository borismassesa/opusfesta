import { NextRequest, NextResponse } from "next/server";
import { supabase } from "@/lib/supabaseClient";
import { createClient } from "@supabase/supabase-js";

// Create a server-side Supabase client with service role for admin operations
const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!,
  {
    auth: {
      autoRefreshToken: false,
      persistSession: false,
    },
  }
);

export async function GET(request: NextRequest) {
  try {
    // Get authenticated admin user
    const authHeader = request.headers.get("authorization");
    if (!authHeader) {
      return NextResponse.json(
        { error: "Authentication required" },
        { status: 401 }
      );
    }

    const token = authHeader.replace("Bearer ", "");
    const { data: { user }, error: authError } = await supabaseAdmin.auth.getUser(token);
    
    if (authError || !user) {
      return NextResponse.json(
        { error: "Invalid authentication" },
        { status: 401 }
      );
    }

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
