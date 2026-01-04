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

interface ReviewRequest {
  vendorId: string;
  inquiryId?: string;
  rating: number;
  title?: string;
  content: string;
  images?: string[];
  eventType?: string;
  eventDate?: string;
}

export async function POST(request: NextRequest) {
  try {
    const body: ReviewRequest = await request.json();

    // Validate required fields
    if (!body.vendorId || !body.rating || !body.content) {
      return NextResponse.json(
        { error: "Missing required fields: vendorId, rating, and content are required" },
        { status: 400 }
      );
    }

    // Validate rating
    if (body.rating < 1 || body.rating > 5) {
      return NextResponse.json(
        { error: "Rating must be between 1 and 5" },
        { status: 400 }
      );
    }

    // Get authenticated user
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

    // Verify vendor exists
    const { data: vendor, error: vendorError } = await supabase
      .from("vendors")
      .select("id")
      .eq("id", body.vendorId)
      .single();

    if (vendorError || !vendor) {
      return NextResponse.json(
        { error: "Vendor not found" },
        { status: 404 }
      );
    }

    // Check if user can review this vendor (must have completed inquiry)
    const { data: canReview, error: canReviewError } = await supabase
      .rpc("can_user_review_vendor", {
        user_uuid: user.id,
        vendor_uuid: body.vendorId,
      });

    if (canReviewError) {
      console.error("Error checking review eligibility:", canReviewError);
      return NextResponse.json(
        { error: "Failed to verify review eligibility" },
        { status: 500 }
      );
    }

    if (!canReview) {
      return NextResponse.json(
        { 
          error: "You can only review vendors you have booked with. Please complete a booking first.",
          code: "NO_BOOKING"
        },
        { status: 403 }
      );
    }

    // Check if user already reviewed this vendor
    const { data: existingReview } = await supabase
      .from("reviews")
      .select("id")
      .eq("user_id", user.id)
      .eq("vendor_id", body.vendorId)
      .single();

    if (existingReview) {
      return NextResponse.json(
        { error: "You have already reviewed this vendor" },
        { status: 400 }
      );
    }

    // If inquiryId is provided, verify it belongs to the user and vendor
    if (body.inquiryId) {
      const { data: inquiry, error: inquiryError } = await supabase
        .from("inquiries")
        .select("id, vendor_id, user_id, status, event_date")
        .eq("id", body.inquiryId)
        .single();

      if (inquiryError || !inquiry) {
        return NextResponse.json(
          { error: "Inquiry not found" },
          { status: 404 }
        );
      }

      if (inquiry.user_id !== user.id) {
        return NextResponse.json(
          { error: "Inquiry does not belong to you" },
          { status: 403 }
        );
      }

      if (inquiry.vendor_id !== body.vendorId) {
        return NextResponse.json(
          { error: "Inquiry does not match vendor" },
          { status: 400 }
        );
      }
    }

    // Parse event date if provided
    let eventDate: Date | null = null;
    if (body.eventDate) {
      eventDate = new Date(body.eventDate);
      if (isNaN(eventDate.getTime())) {
        return NextResponse.json(
          { error: "Invalid event date format" },
          { status: 400 }
        );
      }
    }

    // Create review
    const { data: review, error: reviewError } = await supabase
      .from("reviews")
      .insert({
        vendor_id: body.vendorId,
        user_id: user.id,
        inquiry_id: body.inquiryId || null,
        rating: body.rating,
        title: body.title || null,
        content: body.content,
        images: body.images || [],
        event_type: body.eventType || null,
        event_date: eventDate ? eventDate.toISOString().split("T")[0] : null,
        moderation_status: "pending", // Will be auto-approved if inquiry is completed
        verified: false,
      })
      .select()
      .single();

    if (reviewError) {
      console.error("Error creating review:", reviewError);
      return NextResponse.json(
        { error: "Failed to create review", details: reviewError.message },
        { status: 500 }
      );
    }

    // The trigger will automatically update vendor stats and handle moderation
    // If inquiry is completed, the trigger will auto-approve the review

    return NextResponse.json({
      success: true,
      review: {
        id: review.id,
        vendorId: review.vendor_id,
        rating: review.rating,
        moderationStatus: review.moderation_status,
        verified: review.verified,
        createdAt: review.created_at,
      },
    });
  } catch (error) {
    console.error("Unexpected error creating review:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
