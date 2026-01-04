import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";
import { stripeConnectService } from "@/lib/payments/stripe-connect";

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
 * GET /api/vendors/[id]/stripe-connect
 * Get Stripe Connect account status
 */
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const supabaseAdmin = getSupabaseAdmin();
    const { id: vendorId } = await params;

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

    // Get vendor
    const { data: vendor, error: vendorError } = await supabaseAdmin
      .from("vendors")
      .select(`
        id,
        user_id,
        business_name,
        stripe_account_id,
        stripe_account_status,
        stripe_onboarding_completed,
        stripe_payouts_enabled
      `)
      .eq("id", vendorId)
      .single();

    if (vendorError || !vendor) {
      return NextResponse.json(
        { error: "Vendor not found" },
        { status: 404 }
      );
    }

    // Verify user is the vendor owner
    if (vendor.user_id !== user.id) {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 403 }
      );
    }

    // If account exists, get status from Stripe
    let accountStatus = null;
    if (vendor.stripe_account_id) {
      const status = await stripeConnectService.getAccountStatus(vendor.stripe_account_id);
      if (status.success) {
        accountStatus = status;
      }
    }

    return NextResponse.json({
      vendorId: vendor.id,
      stripeAccountId: vendor.stripe_account_id,
      stripeAccountStatus: vendor.stripe_account_status,
      onboardingCompleted: vendor.stripe_onboarding_completed,
      payoutsEnabled: vendor.stripe_payouts_enabled,
      accountDetails: accountStatus,
    });
  } catch (error) {
    console.error("Unexpected error fetching Stripe Connect status:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

/**
 * POST /api/vendors/[id]/stripe-connect
 * Create or update Stripe Connect account
 */
export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const supabaseAdmin = getSupabaseAdmin();
    const { id: vendorId } = await params;
    const body = await request.json();
    const { returnUrl, refreshUrl } = body;

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

    // Get vendor
    const { data: vendor, error: vendorError } = await supabaseAdmin
      .from("vendors")
      .select(`
        id,
        user_id,
        business_name
      `)
      .eq("id", vendorId)
      .single();

    if (vendorError || !vendor) {
      return NextResponse.json(
        { error: "Vendor not found" },
        { status: 404 }
      );
    }

    // Verify user is the vendor owner
    if (vendor.user_id !== user.id) {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 403 }
      );
    }

    // Get user email
    const { data: { user: authUser } } = await supabaseAdmin.auth.getUser(token);
    const userEmail = authUser?.email || '';

    // Create or get Stripe Connect account
    let accountId = vendor.stripe_account_id;
    let onboardingUrl = null;

    if (!accountId) {
      // Create new account
      const result = await stripeConnectService.createConnectedAccount({
        vendorId: vendor.id,
        email: userEmail,
        businessName: vendor.business_name,
        returnUrl: returnUrl || `${process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000'}/vendor/settings`,
        refreshUrl: refreshUrl || `${process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000'}/vendor/settings`,
      });

      if (!result.success) {
        return NextResponse.json(
          { error: result.error || "Failed to create Stripe account" },
          { status: 500 }
        );
      }

      accountId = result.accountId;
      onboardingUrl = result.onboardingUrl;

      // Update vendor with Stripe account ID
      await supabaseAdmin
        .from("vendors")
        .update({
          stripe_account_id: accountId,
          stripe_account_status: 'pending',
        })
        .eq("id", vendorId);
    } else {
      // Create account link for existing account
      const linkResult = await stripeConnectService.createAccountLink(
        accountId,
        returnUrl || `${process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000'}/vendor/settings`,
        refreshUrl || `${process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000'}/vendor/settings`
      );

      if (linkResult.success) {
        onboardingUrl = linkResult.url;
      }
    }

    return NextResponse.json({
      success: true,
      accountId,
      onboardingUrl,
      message: accountId ? "Account link created" : "Stripe account created",
    });
  } catch (error) {
    console.error("Unexpected error creating Stripe Connect account:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
