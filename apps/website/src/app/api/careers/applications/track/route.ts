import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

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

// GET - Track application status (public, no auth required)
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const applicationId = searchParams.get("id");
    const email = searchParams.get("email");

    if (!applicationId || !email) {
      return NextResponse.json(
        { error: "Application ID and email are required" },
        { status: 400 }
      );
    }

    const supabaseAdmin = getSupabaseAdmin();

    // Fetch application with job posting details
    const { data: application, error } = await supabaseAdmin
      .from("job_applications")
      .select(
        `
        id,
        job_posting_id,
        full_name,
        email,
        status,
        created_at,
        updated_at,
        job_postings (
          id,
          title,
          department
        )
      `
      )
      .eq("id", applicationId)
      .eq("email", email.toLowerCase())
      .single();

    if (error || !application) {
      return NextResponse.json(
        { error: "Application not found. Please check your email and application ID." },
        { status: 404 }
      );
    }

    // Return application status (without sensitive data)
    return NextResponse.json({
      application: {
        id: application.id,
        full_name: application.full_name,
        status: application.status,
        created_at: application.created_at,
        updated_at: application.updated_at,
        job_posting: application.job_postings
          ? {
              id: application.job_postings.id,
              title: application.job_postings.title,
              department: application.job_postings.department,
            }
          : null,
      },
    });
  } catch (error: any) {
    console.error("Error in GET /api/careers/applications/track:", error);
    return NextResponse.json(
      { error: error.message || "Internal server error" },
      { status: 500 }
    );
  }
}
