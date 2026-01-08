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

// Get authenticated user from request
async function getAuthenticatedUser(request: NextRequest): Promise<{ userId: string; email: string } | null> {
  const authHeader = request.headers.get("authorization");
  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    return null;
  }

  const token = authHeader.replace("Bearer ", "");
  
  try {
    const supabaseAdmin = getSupabaseAdmin();
    const { data: { user }, error } = await supabaseAdmin.auth.getUser(token);
    
    if (error || !user) {
      return null;
    }

    // Verify user exists in the users table
    const { data: userData, error: userError } = await supabaseAdmin
      .from("users")
      .select("id")
      .eq("id", user.id)
      .single();

    if (userError || !userData) {
      return null; // User not in database
    }

    return {
      userId: user.id,
      email: user.email || "",
    };
  } catch (error) {
    console.error("Error getting authenticated user:", error);
    return null;
  }
}

// GET - Fetch active job postings (descriptions only for authenticated users)
export async function GET(request: NextRequest) {
  try {
    const supabaseAdmin = getSupabaseAdmin();

    // Check if user is authenticated and exists in database
    const user = await getAuthenticatedUser(request);
    const isAuthenticated = !!user;

    const { data: jobs, error } = await supabaseAdmin
      .from("job_postings")
      .select("*")
      .eq("is_active", true)
      .order("created_at", { ascending: false });

    if (error) {
      console.error("Error fetching job postings:", error);
      return NextResponse.json(
        { error: "Failed to fetch job postings" },
        { status: 500 }
      );
    }

    // If not authenticated, remove sensitive fields
    if (!isAuthenticated && jobs) {
      const sanitizedJobs = jobs.map((job: any) => {
        const { description, requirements, responsibilities, about_thefesta, growth_description, hiring_process, how_to_apply, equal_opportunity_statement, ...rest } = job;
        return rest;
      });
      return NextResponse.json({ jobs: sanitizedJobs || [] });
    }

    return NextResponse.json({ jobs: jobs || [] });
  } catch (error: any) {
    console.error("Error in GET /api/careers/jobs:", error);
    return NextResponse.json(
      { error: error.message || "Internal server error" },
      { status: 500 }
    );
  }
}
