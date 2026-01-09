import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
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

const bulkActionSchema = z.object({
  action: z.enum(["delete", "activate", "deactivate"]),
  jobIds: z.array(z.string().uuid()).min(1, "At least one job ID is required"),
});

export async function POST(request: NextRequest) {
  try {
    if (!(await isAdmin(request))) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json();
    const validationResult = bulkActionSchema.safeParse(body);

    if (!validationResult.success) {
      return NextResponse.json(
        { error: "Validation failed", details: validationResult.error.issues },
        { status: 400 }
      );
    }

    const { action, jobIds } = validationResult.data;
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
