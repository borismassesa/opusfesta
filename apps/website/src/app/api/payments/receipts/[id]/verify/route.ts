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

interface VerifyReceiptRequest {
  isApproved: boolean;
  notes?: string;
}

/**
 * POST /api/payments/receipts/[id]/verify
 * Verify or reject a payment receipt (vendor or admin)
 */
export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const supabaseAdmin = getSupabaseAdmin();
    const { id: receiptId } = await params;
    const body: VerifyReceiptRequest = await request.json();
    const { isApproved, notes } = body;

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

    // Get receipt
    const { data: receipt, error: receiptError } = await supabaseAdmin
      .from("payment_receipts")
      .select(`
        id,
        payment_id,
        vendor_id,
        status
      `)
      .eq("id", receiptId)
      .single();

    if (receiptError || !receipt) {
      return NextResponse.json(
        { error: "Receipt not found" },
        { status: 404 }
      );
    }

    // Check if already verified
    if (receipt.status !== 'pending') {
      return NextResponse.json(
        { error: `Receipt is already ${receipt.status}` },
        { status: 400 }
      );
    }

    // Verify user is vendor owner or admin
    const { data: vendor } = await supabaseAdmin
      .from("vendors")
      .select("user_id")
      .eq("id", receipt.vendor_id)
      .single();

    const isVendor = vendor?.user_id === user.id;

    const { data: userData } = await supabaseAdmin
      .from("users")
      .select("role")
      .eq("id", user.id)
      .single();

    const isAdmin = userData?.role === "admin";

    if (!isVendor && !isAdmin) {
      return NextResponse.json(
        { error: "Unauthorized: Only vendors and admins can verify receipts" },
        { status: 403 }
      );
    }

    // Use database function to verify receipt
    const { error: verifyError } = await supabaseAdmin.rpc("verify_payment_receipt", {
      receipt_uuid: receiptId,
      verifier_uuid: user.id,
      is_approved: isApproved,
      notes: notes || null,
    });

    if (verifyError) {
      console.error("Error verifying receipt:", verifyError);
      return NextResponse.json(
        { error: "Failed to verify receipt", details: verifyError.message },
        { status: 500 }
      );
    }

    // Get updated receipt
    const { data: updatedReceipt } = await supabaseAdmin
      .from("payment_receipts")
      .select(`
        id,
        status,
        verified_by,
        verified_at,
        verification_notes,
        rejection_reason
      `)
      .eq("id", receiptId)
      .single();

    return NextResponse.json({
      success: true,
      receipt: updatedReceipt,
      message: isApproved
        ? "Receipt verified successfully. Payment has been processed."
        : "Receipt rejected.",
    });
  } catch (error) {
    console.error("Unexpected error verifying receipt:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
