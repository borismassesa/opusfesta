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

// Helper function to fetch application status
async function fetchApplicationStatus(applicationId: string, email: string) {
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
    return { error: "Application not found. Please check your email and application ID.", status: 404 };
  }

  // Return application status (without sensitive data)
  return {
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
  };
}

// POST - Track application status (public, no auth required) - More secure than GET
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const applicationId = body.id;
    const email = body.email;

    if (!applicationId || !email) {
      return NextResponse.json(
        { error: "Application ID and email are required" },
        { status: 400 }
      );
    }

    const result = await fetchApplicationStatus(applicationId, email);
    
    if (result.error) {
      return NextResponse.json(
        { error: result.error },
        { status: result.status || 404 }
      );
    }

    return NextResponse.json(result);
  } catch (error: any) {
    console.error("Error in POST /api/careers/applications/track:", error);
    return NextResponse.json(
      { error: error.message || "Internal server error" },
      { status: 500 }
    );
  }
}

// GET - Track application status (public, no auth required) - Deprecated, use POST instead
// Kept for backward compatibility but should be removed in future
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

    const result = await fetchApplicationStatus(applicationId, email);
    
    if (result.error) {
      return NextResponse.json(
        { error: result.error },
        { status: result.status || 404 }
      );
    }

    return NextResponse.json(result);

  } catch (error: any) {
    console.error("Error in GET /api/careers/applications/track:", error);
    return NextResponse.json(
      { error: error.message || "Internal server error" },
      { status: 500 }
    );
  }
}
