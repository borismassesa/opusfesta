import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

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

interface ReviewResponseRequest {
  response: string;
}

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const supabaseAdmin = getSupabaseAdmin();
    const { id: reviewId } = await params;
    const body: ReviewResponseRequest = await request.json();

    // Validate required fields
    if (!body.response || body.response.trim().length === 0) {
      return NextResponse.json(
        { error: "Response text is required" },
        { status: 400 }
      );
    }

    // Get authenticated user (must be the vendor)
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

    // Get the review and verify vendor ownership
    const { data: review, error: reviewError } = await supabase
      .from("reviews")
      .select(`
        id,
        vendor_id,
        vendor_response,
        vendors!inner(user_id)
      `)
      .eq("id", reviewId)
      .single();

    if (reviewError || !review) {
      return NextResponse.json(
        { error: "Review not found" },
        { status: 404 }
      );
    }

    // Check if the authenticated user is the vendor owner
    const vendor = review.vendors as any;
    if (vendor.user_id !== user.id) {
      return NextResponse.json(
        { error: "You can only respond to reviews for your own vendor" },
        { status: 403 }
      );
    }

    // Check if review already has a response
    if (review.vendor_response) {
      return NextResponse.json(
        { error: "Review already has a response. You can update it by sending another request." },
        { status: 400 }
      );
    }

    // Update review with vendor response
    const { data: updatedReview, error: updateError } = await supabase
      .from("reviews")
      .update({
        vendor_response: body.response.trim(),
        vendor_responded_at: new Date().toISOString(),
      })
      .eq("id", reviewId)
      .select()
      .single();

    if (updateError) {
      console.error("Error updating review response:", updateError);
      return NextResponse.json(
        { error: "Failed to add response", details: updateError.message },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      review: {
        id: updatedReview.id,
        vendorResponse: updatedReview.vendor_response,
        vendorRespondedAt: updatedReview.vendor_responded_at,
      },
    });
  } catch (error) {
    console.error("Unexpected error adding review response:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
