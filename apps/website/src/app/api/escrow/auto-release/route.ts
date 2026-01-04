import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

// Mark route as dynamic to prevent static analysis during build
export const dynamic = 'force-dynamic';
export const runtime = 'nodejs';

// Lazy initialization of Supabase admin client
function getSupabaseAdmin() {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

  if (!supabaseUrl || !serviceRoleKey) {
    throw new Error("Missing required Supabase environment variables");
  }

  return createClient(supabaseUrl, serviceRoleKey, {
    auth: {
      autoRefreshToken: false,
      persistSession: false,
    },
  });
}

/**
 * POST /api/escrow/auto-release
 * Auto-release eligible escrow holds (Airbnb-style: 24h after work completion)
 * This endpoint should be called by a scheduled job (cron)
 */
export async function POST(request: NextRequest) {
  try {
    const supabaseAdmin = getSupabaseAdmin();
    // Optional: Add API key authentication for cron jobs
    const apiKey = request.headers.get("x-api-key");
    if (apiKey !== process.env.CRON_API_KEY && process.env.CRON_API_KEY) {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      );
    }

    // Call database function to auto-release eligible holds
    const { data, error } = await supabaseAdmin.rpc("auto_release_eligible_escrow_holds");

    if (error) {
      console.error("Error auto-releasing escrow holds:", error);
      return NextResponse.json(
        { error: "Failed to auto-release escrow holds", details: error.message },
        { status: 500 }
      );
    }

    const result = data?.[0] || { released_count: 0, released_holds: [] };

    return NextResponse.json({
      success: true,
      releasedCount: result.released_count || 0,
      releasedHolds: result.released_holds || [],
      message: `Auto-released ${result.released_count || 0} escrow hold(s)`,
    });
  } catch (error) {
    console.error("Unexpected error in auto-release:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

/**
 * GET /api/escrow/auto-release
 * Get holds ready for auto-release (for monitoring)
 */
export async function GET(request: NextRequest) {
  try {
    const supabaseAdmin = getSupabaseAdmin();
    // Authenticate user (admin only)
    const authHeader = request.headers.get("authorization");
    if (!authHeader) {
      return NextResponse.json(
        { error: "Authentication required" },
        { status: 401 }
      );
    }

    const token = authHeader.replace("Bearer ", "");
    const { data: { user }, error: authError } = await supabaseAdmin.auth.getUser(token);

    if (authError || !user) {
      return NextResponse.json(
        { error: "Invalid authentication" },
        { status: 401 }
      );
    }

    // Verify admin
    const { data: userData } = await supabaseAdmin
      .from("users")
      .select("role")
      .eq("id", user.id)
      .single();

    if (userData?.role !== "admin") {
      return NextResponse.json(
        { error: "Unauthorized: Admin access required" },
        { status: 403 }
      );
    }

    // Get holds ready for auto-release
    const { data: holds, error: holdsError } = await supabaseAdmin
      .rpc("get_holds_ready_for_auto_release");

    if (holdsError) {
      console.error("Error fetching holds ready for release:", holdsError);
      return NextResponse.json(
        { error: "Failed to fetch holds", details: holdsError.message },
        { status: 500 }
      );
    }

    return NextResponse.json({
      holds: holds || [],
      count: (holds || []).length,
    });
  } catch (error) {
    console.error("Unexpected error fetching auto-release holds:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
