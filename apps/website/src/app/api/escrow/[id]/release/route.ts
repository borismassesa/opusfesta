import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";
import { stripeConnectService } from "@/lib/payments/stripe-connect";
import { getAuthenticatedUser } from "@/lib/api-auth";

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

interface ReleaseFundsRequest {
  releaseMethod?: 'automatic' | 'manual' | 'scheduled';
  releaseReason?: string;
}

/**
 * POST /api/escrow/[id]/release
 * Release escrow funds to vendor (admin or automatic after work completion)
 */
export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const supabaseAdmin = getSupabaseAdmin();
    const { id: holdId } = await params;
    const body: ReleaseFundsRequest = await request.json();
    const { releaseMethod = 'manual', releaseReason } = body;

    // Authenticate user (admin only for manual release)
    const user = await getAuthenticatedUser();
    if (!user) {
      return NextResponse.json(
        { error: "Authentication required" },
        { status: 401 }
      );
    }

    // Get escrow hold
    const { data: hold, error: holdError } = await supabaseAdmin
      .from("escrow_holds")
      .select(`
        id,
        vendor_id,
        vendor_amount,
        currency,
        work_completed,
        status,
        payment_id
      `)
      .eq("id", holdId)
      .single();

    if (holdError || !hold) {
      return NextResponse.json(
        { error: "Escrow hold not found" },
        { status: 404 }
      );
    }

    // Check if work is completed
    if (!hold.work_completed) {
      return NextResponse.json(
        { error: "Work must be completed before releasing funds" },
        { status: 400 }
      );
    }

    // Check if already released
    if (hold.status === 'released') {
      return NextResponse.json(
        { error: "Funds have already been released" },
        { status: 400 }
      );
    }

    // Verify user is admin (for manual release)
    if (releaseMethod === 'manual') {
      const { data: userData } = await supabaseAdmin
        .from("users")
        .select("role")
        .eq("id", user.id)
        .single();

      if (userData?.role !== "admin") {
        return NextResponse.json(
          { error: "Unauthorized: Only admins can manually release funds" },
          { status: 403 }
        );
      }
    }

    // Release funds via database function
    const { error: releaseError } = await supabaseAdmin.rpc("release_escrow_funds", {
      hold_uuid: holdId,
      release_method: releaseMethod,
      release_reason: releaseReason || "Work completed and verified",
      released_by_uuid: user.id,
    });

    if (releaseError) {
      console.error("Error releasing escrow funds:", releaseError);
      return NextResponse.json(
        { error: "Failed to release funds", details: releaseError.message },
        { status: 500 }
      );
    }

    // Get vendor's Stripe account
    const { data: vendor } = await supabaseAdmin
      .from("vendors")
      .select("stripe_account_id, stripe_payouts_enabled")
      .eq("id", hold.vendor_id)
      .single();

    // If vendor has Stripe Connect, initiate transfer
    if (vendor?.stripe_account_id && vendor?.stripe_payouts_enabled) {
      const amountInCents = Math.round(parseFloat(hold.vendor_amount.toString()) * 100);
      
      // Get payment to get payment intent ID
      const { data: payment } = await supabaseAdmin
        .from("payments")
        .select("provider_ref")
        .eq("id", hold.payment_id)
        .single();

      if (payment?.provider_ref) {
        const transferResult = await stripeConnectService.transferToVendor({
          paymentIntentId: payment.provider_ref,
          vendorStripeAccountId: vendor.stripe_account_id,
          amount: amountInCents,
          currency: hold.currency || 'usd',
          metadata: {
            escrow_hold_id: holdId,
            payment_id: hold.payment_id,
            release_method: releaseMethod,
          },
        });

        if (transferResult.success && transferResult.transferId) {
          // Update vendor revenue with transfer info
          await supabaseAdmin
            .from("vendor_revenue")
            .update({
              transfer_id: transferResult.transferId,
              transfer_status: 'paid',
              transferred_at: new Date().toISOString(),
            })
            .eq("payment_id", hold.payment_id);
        }
      }
    }

    // Get updated hold
    const { data: updatedHold } = await supabaseAdmin
      .from("escrow_holds")
      .select(`
        id,
        status,
        released_at,
        release_method,
        release_reason
      `)
      .eq("id", holdId)
      .single();

    return NextResponse.json({
      success: true,
      hold: updatedHold,
      message: "Funds released successfully. Vendor will receive payment shortly.",
    });
  } catch (error) {
    console.error("Unexpected error releasing escrow funds:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
