import { NextRequest, NextResponse } from "next/server";
import { getSupabaseAdmin } from "@/lib/supabaseAdmin";

// Check if user is admin
async function isAdmin(request: NextRequest): Promise<boolean> {
  const authHeader = request.headers.get("authorization");
  if (!authHeader) return false;

  const token = authHeader.replace("Bearer ", "");
  const supabaseAdmin = getSupabaseAdmin();
  const { data: { user }, error } = await supabaseAdmin.auth.getUser(token);

  if (error || !user) return false;

  const { data: userData } = await supabaseAdmin
    .from("users")
    .select("role")
    .eq("id", user.id)
    .single();

  return userData?.role === "admin";
}

// GET - List all applications (admin only)
export async function GET(request: NextRequest) {
  try {
    if (!(await isAdmin(request))) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const supabaseAdmin = getSupabaseAdmin();
    const { searchParams } = new URL(request.url);
    const jobPostingId = searchParams.get("jobPostingId");
    const status = searchParams.get("status");

    let query = supabaseAdmin
      .from("job_applications")
      .select(`
        *,
        job_postings (
          id,
          title,
          department
        )
      `);

    if (jobPostingId) {
      query = query.eq("job_posting_id", jobPostingId);
    }

    if (status) {
      query = query.eq("status", status);
    }

    const { data: applications, error } = await query.order("created_at", { ascending: false });

    if (error) {
      console.error("Error fetching applications:", error);
      return NextResponse.json(
        { error: "Failed to fetch applications" },
        { status: 500 }
      );
    }

    return NextResponse.json({ applications: applications || [] });
  } catch (error: any) {
    console.error("Error in GET /api/admin/careers/applications:", error);
    return NextResponse.json(
      { error: error.message || "Internal server error" },
      { status: 500 }
    );
  }
}

// Get authenticated user ID
async function getAuthenticatedUserId(request: NextRequest): Promise<string> {
  const authHeader = request.headers.get("authorization");
  if (!authHeader) {
    throw new Error("No authorization header");
  }

  const token = authHeader.replace("Bearer ", "");
  const supabaseAdmin = getSupabaseAdmin();
  const { data: { user }, error } = await supabaseAdmin.auth.getUser(token);

  if (error || !user || !user.id) {
    throw new Error("Failed to get user from token");
  }

  return user.id;
}

// PATCH - Update application status/notes (admin only)
export async function PATCH(request: NextRequest) {
  try {
    if (!(await isAdmin(request))) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json();
    const { id, status, notes } = body;

    if (!id) {
      return NextResponse.json({ error: "Application ID is required" }, { status: 400 });
    }

    const supabaseAdmin = getSupabaseAdmin();
    
    // Get authenticated user ID for activity logging
    const userId = await getAuthenticatedUserId(request);

    // Validate status if provided
    if (status) {
      const validStatuses = [
        "pending",
        "reviewing",
        "phone_screen",
        "technical_interview",
        "final_interview",
        "interviewed",
        "offer_extended",
        "offer_accepted",
        "offer_declined",
        "rejected",
        "hired",
      ];
      if (!validStatuses.includes(status)) {
        return NextResponse.json({ error: "Invalid status" }, { status: 400 });
      }
    }

    // Build update data object - only include fields that are being updated
    const updateData: any = {};
    if (status) {
      updateData.status = status;
    }
    if (notes !== undefined) {
      updateData.notes = notes;
    }

    // Use the database function that sets user context for triggers
    const { data: applicationData, error: rpcError } = await supabaseAdmin.rpc(
      'update_application_with_user_context',
      {
        p_application_id: id,
        p_user_id: userId,
        p_update_data: updateData,
      }
    );

    if (rpcError) {
      console.error("Error updating application:", rpcError);
      return NextResponse.json(
        { error: "Failed to update application" },
        { status: 500 }
      );
    }

    // Fetch the full application with job_postings relation
    const { data: application, error: fetchError } = await supabaseAdmin
      .from("job_applications")
      .select(`
        *,
        job_postings (
          id,
          title,
          department
        )
      `)
      .eq("id", id)
      .single();

    if (fetchError || !application) {
      console.error("Error fetching updated application:", fetchError);
      return NextResponse.json(
        { error: "Failed to fetch updated application" },
        { status: 500 }
      );
    }

    // Activity logging is handled automatically by database triggers
    // See: supabase/migrations/045_fix_activity_log_user_context.sql

    return NextResponse.json({ application });
  } catch (error: any) {
    console.error("Error in PATCH /api/admin/careers/applications:", error);
    return NextResponse.json(
      { error: error.message || "Internal server error" },
      { status: 500 }
    );
  }
}
