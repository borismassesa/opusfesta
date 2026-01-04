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

interface CompleteWorkRequest {
  verificationNotes?: string;
}

/**
 * POST /api/escrow/[id]/complete-work
 * Mark work as completed (vendor or customer can mark)
 */
export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const supabaseAdmin = getSupabaseAdmin();
    const { id: holdId } = await params;
    const body: CompleteWorkRequest = await request.json();
    const { verificationNotes } = body;

    // Authenticate user
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

    // Get escrow hold
    const { data: hold, error: holdError } = await supabaseAdmin
      .from("escrow_holds")
      .select(`
        id,
        vendor_id,
        user_id,
        work_completed,
        status
      `)
      .eq("id", holdId)
      .single();

    if (holdError || !hold) {
      return NextResponse.json(
        { error: "Escrow hold not found" },
        { status: 404 }
      );
    }

    // Check if already completed
    if (hold.work_completed) {
      return NextResponse.json(
        { error: "Work is already marked as completed" },
        { status: 400 }
      );
    }

    // Verify user is vendor, customer, or admin
    const { data: vendor } = await supabaseAdmin
      .from("vendors")
      .select("user_id")
      .eq("id", hold.vendor_id)
      .single();

    const isVendor = vendor?.user_id === user.id;
    const isCustomer = hold.user_id === user.id;

    const { data: userData } = await supabaseAdmin
      .from("users")
      .select("role")
      .eq("id", user.id)
      .single();

    const isAdmin = userData?.role === "admin";

    if (!isVendor && !isCustomer && !isAdmin) {
      return NextResponse.json(
        { error: "Unauthorized: Only vendor, customer, or admin can mark work as completed" },
        { status: 403 }
      );
    }

    // Mark work as completed
    const { error: completeError } = await supabaseAdmin.rpc("mark_work_completed", {
      hold_uuid: holdId,
      verifier_uuid: user.id,
      verification_notes: verificationNotes || null,
    });

    if (completeError) {
      console.error("Error marking work as completed:", completeError);
      return NextResponse.json(
        { error: "Failed to mark work as completed", details: completeError.message },
        { status: 500 }
      );
    }

    // Get updated hold
    const { data: updatedHold } = await supabaseAdmin
      .from("escrow_holds")
      .select(`
        id,
        work_completed,
        work_completed_at,
        work_verified_by,
        work_verified_at,
        status
      `)
      .eq("id", holdId)
      .single();

    return NextResponse.json({
      success: true,
      hold: updatedHold,
      message: "Work marked as completed. Funds are now ready for release.",
    });
  } catch (error) {
    console.error("Unexpected error completing work:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
