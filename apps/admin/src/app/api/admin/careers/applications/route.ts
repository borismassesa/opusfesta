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

    const authHeader = request.headers.get("authorization");
    const token = authHeader?.replace("Bearer ", "");
    const supabaseAdmin = getSupabaseAdmin();
    const { data: { user } } = await supabaseAdmin.auth.getUser(token || "");

    // Get current application state before update
    const { data: currentApplication } = await supabaseAdmin
      .from("job_applications")
      .select("status, notes")
      .eq("id", id)
      .single();

    const updateData: any = {};
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
      updateData.status = status;
    }
    if (notes !== undefined) {
      updateData.notes = notes;
    }

    const { data: application, error } = await supabaseAdmin
      .from("job_applications")
      .update(updateData)
      .eq("id", id)
      .select(`
        *,
        job_postings (
          id,
          title,
          department
        )
      `)
      .single();

    if (error) {
      console.error("Error updating application:", error);
      return NextResponse.json(
        { error: "Failed to update application" },
        { status: 500 }
      );
    }

    // Manually log status changes and notes to activity log (as backup to triggers)
    // The triggers should handle this, but we'll also log here for API updates
    if (status && currentApplication && currentApplication.status !== status) {
      await supabaseAdmin
        .from("application_activity_log")
        .insert({
          application_id: id,
          action_type: "status_changed",
          action_details: {
            old_status: currentApplication.status,
            new_status: status,
          },
          performed_by: user?.id || null,
        });
    }

    if (notes !== undefined && currentApplication && currentApplication.notes !== notes) {
      await supabaseAdmin
        .from("application_activity_log")
        .insert({
          application_id: id,
          action_type: "note_added",
          action_details: {
            old_notes: currentApplication.notes,
            new_notes: notes,
            has_notes: notes !== null && notes !== "",
          },
          performed_by: user?.id || null,
        });
    }

    return NextResponse.json({ application });
  } catch (error: any) {
    console.error("Error in PATCH /api/admin/careers/applications:", error);
    return NextResponse.json(
      { error: error.message || "Internal server error" },
      { status: 500 }
    );
  }
}
