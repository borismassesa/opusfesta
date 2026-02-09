import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";
import { z } from "zod";
import { getAuthenticatedUser } from "@/lib/api-auth";

// Get Supabase admin client
function getSupabaseAdmin() {
  if (!process.env.NEXT_PUBLIC_SUPABASE_URL || !process.env.SUPABASE_SERVICE_ROLE_KEY) {
    throw new Error("Missing Supabase configuration");
  }

  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL,
    process.env.SUPABASE_SERVICE_ROLE_KEY,
    {
      auth: {
        autoRefreshToken: false,
        persistSession: false,
      },
    }
  );
}

// Check if user is admin
async function isAdmin(): Promise<boolean> {
  const user = await getAuthenticatedUser();
  if (!user) return false;

  const supabaseAdmin = getSupabaseAdmin();
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
    if (!(await isAdmin())) {
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
    if (!(await isAdmin())) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json();
    const { id, status, notes } = body;

    if (!id) {
      return NextResponse.json({ error: "Application ID is required" }, { status: 400 });
    }

    const updateData: any = {};
    if (status) {
      const validStatuses = ["pending", "reviewing", "interviewed", "rejected", "hired"];
      if (!validStatuses.includes(status)) {
        return NextResponse.json({ error: "Invalid status" }, { status: 400 });
      }
      updateData.status = status;
    }
    if (notes !== undefined) {
      updateData.notes = notes;
    }

    const supabaseAdmin = getSupabaseAdmin();
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

    return NextResponse.json({ application });
  } catch (error: any) {
    console.error("Error in PATCH /api/admin/careers/applications:", error);
    return NextResponse.json(
      { error: error.message || "Internal server error" },
      { status: 500 }
    );
  }
}
