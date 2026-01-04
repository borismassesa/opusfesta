import { NextRequest, NextResponse } from "next/server";
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

/**
 * GET /api/inquiries
 * Get all inquiries for the authenticated user
 * Supports filtering by status
 */
export async function GET(request: NextRequest) {
  try {
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

    // Get query parameters
    const { searchParams } = new URL(request.url);
    const status = searchParams.get("status"); // optional filter: pending, accepted, declined, closed

    // Build query
    let query = supabaseAdmin
      .from("inquiries")
      .select(`
        id,
        vendor_id,
        user_id,
        name,
        email,
        phone,
        event_type,
        event_date,
        guest_count,
        budget,
        location,
        message,
        status,
        vendor_response,
        responded_at,
        created_at,
        updated_at,
        vendors!inner(
          id,
          business_name,
          category,
          slug,
          logo,
          contact_info
        )
      `)
      .eq("user_id", user.id)
      .order("created_at", { ascending: false });

    // Apply status filter if provided
    if (status) {
      query = query.eq("status", status);
    }

    const { data: inquiries, error: inquiriesError } = await query;

    if (inquiriesError) {
      console.error("Error fetching inquiries:", inquiriesError);
      return NextResponse.json(
        { error: "Failed to fetch inquiries", details: inquiriesError.message },
        { status: 500 }
      );
    }

    return NextResponse.json({
      inquiries: inquiries || [],
      count: inquiries?.length || 0,
    });
  } catch (error: any) {
    console.error("Unexpected error fetching inquiries:", error);
    return NextResponse.json(
      { error: "Internal server error", details: error.message },
      { status: 500 }
    );
  }
}
