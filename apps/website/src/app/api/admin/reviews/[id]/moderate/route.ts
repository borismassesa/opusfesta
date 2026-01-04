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

interface ModerateRequest {
  action: "approve" | "reject" | "flag";
  reason?: string;
  notes?: string;
}

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id: reviewId } = await params;
    const body: ModerateRequest = await request.json();

    // Validate action
    if (!body.action || !["approve", "reject", "flag"].includes(body.action)) {
      return NextResponse.json(
        { error: "Invalid action. Must be 'approve', 'reject', or 'flag'" },
        { status: 400 }
      );
    }

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

    // Get the review
    const { data: review, error: reviewError } = await supabaseAdmin
      .from("reviews")
      .select("id, vendor_id, moderation_status")
      .eq("id", reviewId)
      .single();

    if (reviewError || !review) {
      return NextResponse.json(
        { error: "Review not found" },
        { status: 404 }
      );
    }

    // Perform moderation action using the database function
    let result;
    if (body.action === "approve") {
      const { error: approveError } = await supabaseAdmin.rpc("approve_review", {
        review_uuid: reviewId,
        moderator_uuid: user.id,
      });
      if (approveError) throw approveError;
    } else if (body.action === "reject") {
      const { error: rejectError } = await supabaseAdmin.rpc("reject_review", {
        review_uuid: reviewId,
        moderator_uuid: user.id,
        rejection_reason: body.reason || body.notes || null,
      });
      if (rejectError) throw rejectError;
    } else if (body.action === "flag") {
      const { error: flagError } = await supabaseAdmin.rpc("flag_review", {
        review_uuid: reviewId,
        flag_reason: body.reason || body.notes || "Flagged for review",
      });
      if (flagError) throw flagError;
    }

    // Update moderation notes if provided
    if (body.notes) {
      await supabaseAdmin
        .from("reviews")
        .update({ moderation_notes: body.notes })
        .eq("id", reviewId);
    }

    // Get updated review
    const { data: updatedReview } = await supabaseAdmin
      .from("reviews")
      .select("id, moderation_status, verified, moderated_at")
      .eq("id", reviewId)
      .single();

    return NextResponse.json({
      success: true,
      review: {
        id: updatedReview?.id,
        moderationStatus: updatedReview?.moderation_status,
        verified: updatedReview?.verified,
        moderatedAt: updatedReview?.moderated_at,
      },
    });
  } catch (error) {
    console.error("Unexpected error moderating review:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
