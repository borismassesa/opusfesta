import { NextRequest, NextResponse } from "next/server";
import { supabase } from "@/lib/supabaseClient";
import { createClient } from "@supabase/supabase-js";

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

interface UpdateInquiryStatusRequest {
  status: 'accepted' | 'responded' | 'declined' | 'closed';
  message?: string;
}

/**
 * PUT /api/inquiries/[id]/status
 * Update inquiry status (vendor only)
 */
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id: inquiryId } = await params;
    const body: UpdateInquiryStatusRequest = await request.json();
    const { status, message } = body;

    // Authenticate user
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

    // Validate status
    const validStatuses = ['accepted', 'responded', 'declined', 'closed'];
    if (!status || !validStatuses.includes(status)) {
      return NextResponse.json(
        { error: `Invalid status. Must be one of: ${validStatuses.join(', ')}` },
        { status: 400 }
      );
    }

    // Get inquiry and verify vendor ownership
    const { data: inquiry, error: inquiryError } = await supabaseAdmin
      .from("inquiries")
      .select(`
        id,
        vendor_id,
        status,
        event_date,
        vendors!inner(id, user_id, business_name)
      `)
      .eq("id", inquiryId)
      .single();

    if (inquiryError || !inquiry) {
      return NextResponse.json(
        { error: "Inquiry not found" },
        { status: 404 }
      );
    }

    // Verify the authenticated user is the vendor
    if (inquiry.vendors.user_id !== user.id) {
      return NextResponse.json(
        { error: "Unauthorized: You can only update inquiries for your own vendors" },
        { status: 403 }
      );
    }

    // Check if status transition is valid
    const currentStatus = inquiry.status;
    if (currentStatus === 'closed') {
      return NextResponse.json(
        { error: "Cannot update a closed inquiry" },
        { status: 400 }
      );
    }

    // Update inquiry status
    const updateData: any = {
      status: status,
      updated_at: new Date().toISOString(),
    };

    // Add vendor response message if provided
    if (message) {
      updateData.vendor_response = message;
      updateData.responded_at = new Date().toISOString();
    }

    // If accepting, set responded_at if not already set
    if (status === 'accepted' && !inquiry.responded_at) {
      updateData.responded_at = new Date().toISOString();
    }

    const { data: updatedInquiry, error: updateError } = await supabaseAdmin
      .from("inquiries")
      .update(updateData)
      .eq("id", inquiryId)
      .select()
      .single();

    if (updateError) {
      console.error("Error updating inquiry status:", updateError);
      return NextResponse.json(
        { error: "Failed to update inquiry status", details: updateError.message },
        { status: 500 }
      );
    }

    // If inquiry is accepted and has event_date, update availability
    // (The trigger in migration 009_vendor_availability.sql handles this automatically)
    // But we can also explicitly update it here for clarity
    if (status === 'accepted' && inquiry.event_date) {
      await supabaseAdmin
        .from("vendor_availability")
        .upsert({
          vendor_id: inquiry.vendor_id,
          date: inquiry.event_date,
          is_available: false,
          reason: 'Booked via inquiry',
        }, {
          onConflict: "vendor_id,date",
        });
    }

    // If inquiry is declined or closed, mark date as available again
    if ((status === 'declined' || status === 'closed') && inquiry.event_date) {
      await supabaseAdmin
        .from("vendor_availability")
        .update({
          is_available: true,
          reason: null,
        })
        .eq("vendor_id", inquiry.vendor_id)
        .eq("date", inquiry.event_date);
    }

    return NextResponse.json({
      success: true,
      inquiry: {
        id: updatedInquiry.id,
        status: updatedInquiry.status,
        vendorResponse: updatedInquiry.vendor_response,
        respondedAt: updatedInquiry.responded_at,
        updatedAt: updatedInquiry.updated_at,
      },
      message: `Inquiry ${status} successfully`,
    });
  } catch (error) {
    console.error("Unexpected error updating inquiry status:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
