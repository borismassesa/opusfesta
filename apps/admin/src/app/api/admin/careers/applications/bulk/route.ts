import { NextRequest, NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import { getSupabaseAdmin } from "@/lib/supabaseAdmin";
import { z } from "zod";

// Check if user is admin
async function isAdmin(): Promise<boolean> {
  const { userId: clerkUserId } = await auth();
  if (!clerkUserId) return false;

  const supabaseAdmin = getSupabaseAdmin();
  const { data: userData } = await supabaseAdmin
    .from("users")
    .select("role")
    .eq("clerk_id", clerkUserId)
    .single();

  return userData?.role === "admin";
}

// Get authenticated user's database UUID
async function getAuthenticatedUserId(): Promise<string> {
  const { userId: clerkUserId } = await auth();
  if (!clerkUserId) throw new Error("Not authenticated");

  const supabaseAdmin = getSupabaseAdmin();
  const { data: userData, error } = await supabaseAdmin
    .from("users")
    .select("id")
    .eq("clerk_id", clerkUserId)
    .single();

  if (error || !userData) throw new Error("Failed to get user from Clerk ID");
  return userData.id;
}

// Validation schema
const bulkActionSchema = z.object({
  action: z.enum(["delete", "activate", "deactivate"]),
  applicationIds: z.array(z.string().uuid()).min(1, "At least one application ID is required"),
});

// POST - Bulk operations on job applications
export async function POST(request: NextRequest) {
  try {
    if (!(await isAdmin())) {
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

    const { action, applicationIds } = validationResult.data;
    const supabaseAdmin = getSupabaseAdmin();
    const userId = await getAuthenticatedUserId();

    let result;
    let error;

    switch (action) {
      case "delete":
        // Delete applications (cascade will handle related records)
        const { error: deleteError } = await supabaseAdmin
          .from("job_applications")
          .delete()
          .in("id", applicationIds);
        error = deleteError;
        result = { deleted: applicationIds.length };
        break;

      case "activate":
        // Activate = move to "reviewing" status
        const { error: activateError } = await supabaseAdmin
          .from("job_applications")
          .update({ status: "reviewing" })
          .in("id", applicationIds);
        error = activateError;
        result = { activated: applicationIds.length };
        break;

      case "deactivate":
        // Deactivate = move to "pending" status
        const { error: deactivateError } = await supabaseAdmin
          .from("job_applications")
          .update({ status: "pending" })
          .in("id", applicationIds);
        error = deactivateError;
        result = { deactivated: applicationIds.length };
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
        { error: `Failed to ${action} applications` },
        { status: 500 }
      );
    }

    return NextResponse.json(result);
  } catch (error: any) {
    console.error("Error in POST /api/admin/careers/applications/bulk:", error);
    return NextResponse.json(
      { error: error.message || "Internal server error" },
      { status: 500 }
    );
  }
}
