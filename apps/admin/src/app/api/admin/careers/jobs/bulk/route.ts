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

export async function POST(request: NextRequest) {
  try {
    if (!(await isAdmin(request))) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json();
    const { action, jobIds } = body;

    // Validate action
    if (!action || !["delete", "activate", "deactivate"].includes(action)) {
      return NextResponse.json(
        { error: "Validation failed", details: "Action must be 'delete', 'activate', or 'deactivate'" },
        { status: 400 }
      );
    }

    // Validate jobIds
    if (!Array.isArray(jobIds) || jobIds.length === 0) {
      return NextResponse.json(
        { error: "Validation failed", details: "At least one job ID is required" },
        { status: 400 }
      );
    }

    // Basic UUID validation (simple check)
    const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
    const invalidIds = jobIds.filter((id: any) => typeof id !== "string" || !uuidRegex.test(id));
    if (invalidIds.length > 0) {
      return NextResponse.json(
        { error: "Validation failed", details: "Invalid job ID format" },
        { status: 400 }
      );
    }
    const ids = jobIds;
    
    const supabaseAdmin = getSupabaseAdmin();

    let result;
    let error;

    switch (action) {
      case "delete":
        const { error: deleteError } = await supabaseAdmin
          .from("job_postings")
          .delete()
          .in("id", ids);
        error = deleteError;
        result = { deleted: ids.length };
        break;

      case "activate":
        const { error: activateError } = await supabaseAdmin
          .from("job_postings")
          .update({ is_active: true })
          .in("id", ids);
        error = activateError;
        result = { activated: ids.length };
        break;

      case "deactivate":
        const { error: deactivateError } = await supabaseAdmin
          .from("job_postings")
          .update({ is_active: false })
          .in("id", ids);
        error = deactivateError;
        result = { deactivated: ids.length };
        break;

      default:
        return NextResponse.json(
          { error: "Invalid action" },
          { status: 400 }
        );
    }

    if (error) {
      console.error(`Error performing bulk ${action}:`, error);
      return NextResponse.json(
        { error: `Failed to ${action} job postings` },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      ...result,
    });
  } catch (error: any) {
    console.error("Error in POST /api/admin/careers/jobs/bulk:", error);
    return NextResponse.json(
      { error: error.message || "Internal server error" },
      { status: 500 }
    );
  }
}
