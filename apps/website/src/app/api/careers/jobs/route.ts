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

// GET - Fetch active job postings (public - everyone can see full details)
export async function GET(request: NextRequest) {
  try {
    const supabaseAdmin = getSupabaseAdmin();

    const { data: jobs, error } = await supabaseAdmin
      .from("job_postings")
      .select("*")
      .eq("is_active", true)
      .order("created_at", { ascending: false });

    if (error) {
      console.error("Error fetching job postings from Supabase:", error);
      // Return empty array instead of error to prevent UI from breaking
      return NextResponse.json({ jobs: [] });
    }

    // Job descriptions are PUBLIC - return full details for everyone
    return NextResponse.json({ jobs: jobs || [] });
  } catch (error: any) {
    console.error("Error in GET /api/careers/jobs:", error);
    // Always return a response, even on error - return empty array
    return NextResponse.json({ jobs: [] });
  }
}
