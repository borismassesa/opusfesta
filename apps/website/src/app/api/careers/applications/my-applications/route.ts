import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";
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

// GET - Fetch user's applications
export async function GET(request: NextRequest) {
  try {
    // Check authentication
    const user = await getAuthenticatedUser();
    if (!user) {
      return NextResponse.json(
        { error: "Authentication required" },
        { status: 401 }
      );
    }

    const supabaseAdmin = getSupabaseAdmin();
    const { searchParams } = new URL(request.url);
    const statusFilter = searchParams.get("status");
    const includeDrafts = searchParams.get("includeDrafts") === "true";

    // Build query
    let query = supabaseAdmin
      .from("job_applications")
      .select(`
        id,
        job_posting_id,
        full_name,
        email,
        phone,
        status,
        is_draft,
        created_at,
        updated_at,
        job_postings (
          id,
          title,
          department,
          location,
          employment_type
        )
      `)
      .eq("user_id", user.id)
      .order("created_at", { ascending: false });

    // Apply filters
    if (statusFilter && statusFilter !== "all") {
      if (statusFilter === "drafts") {
        query = query.eq("is_draft", true);
      } else {
        query = query.eq("status", statusFilter).eq("is_draft", false);
      }
    } else if (!includeDrafts) {
      // By default, exclude drafts unless explicitly requested
      query = query.eq("is_draft", false);
    }

    const { data: applications, error } = await query;

    if (error) {
      console.error("Error fetching applications:", error);
      return NextResponse.json(
        { error: "Failed to fetch applications" },
        { status: 500 }
      );
    }

    return NextResponse.json({
      applications: applications || [],
    });
  } catch (error: any) {
    console.error("Error in GET /api/careers/applications/my-applications:", error);
    return NextResponse.json(
      { error: error.message || "Internal server error" },
      { status: 500 }
    );
  }
}
