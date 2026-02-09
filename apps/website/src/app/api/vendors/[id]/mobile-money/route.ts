import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";
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

interface MobileMoneyAccount {
  provider: string;
  phone_number: string;
  account_name: string;
  is_primary?: boolean;
}

/**
 * GET /api/vendors/[id]/mobile-money
 * Get vendor's mobile money accounts
 */
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const supabaseAdmin = getSupabaseAdmin();
    const { id: vendorId } = await params;

    // Get vendor
    const { data: vendor, error: vendorError } = await supabaseAdmin
      .from("vendors")
      .select("id, mobile_money_accounts")
      .eq("id", vendorId)
      .single();

    if (vendorError || !vendor) {
      return NextResponse.json(
        { error: "Vendor not found" },
        { status: 404 }
      );
    }

    return NextResponse.json({
      vendorId: vendor.id,
      mobileMoneyAccounts: vendor.mobile_money_accounts || [],
    });
  } catch (error) {
    console.error("Unexpected error fetching mobile money accounts:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

/**
 * PUT /api/vendors/[id]/mobile-money
 * Update vendor's mobile money accounts
 */
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const supabaseAdmin = getSupabaseAdmin();
    const { id: vendorId } = await params;
    const body: { accounts: MobileMoneyAccount[] } = await request.json();
    const { accounts } = body;

    // Authenticate user
    const user = await getAuthenticatedUser();
    if (!user) {
      return NextResponse.json(
        { error: "Authentication required" },
        { status: 401 }
      );
    }

    // Verify user is the vendor owner
    const { data: vendor } = await supabaseAdmin
      .from("vendors")
      .select("user_id")
      .eq("id", vendorId)
      .single();

    if (!vendor || vendor.user_id !== user.id) {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 403 }
      );
    }

    // Validate accounts
    if (!Array.isArray(accounts)) {
      return NextResponse.json(
        { error: "Accounts must be an array" },
        { status: 400 }
      );
    }

    // Validate each account
    for (const account of accounts) {
      if (!account.provider || !account.phone_number || !account.account_name) {
        return NextResponse.json(
          { error: "Each account must have provider, phone_number, and account_name" },
          { status: 400 }
        );
      }

      // Validate provider
      const validProviders = ['MPESA', 'AIRTEL_MONEY', 'TIGO_PESA', 'HALO_PESA'];
      if (!validProviders.includes(account.provider)) {
        return NextResponse.json(
          { error: `Invalid provider: ${account.provider}. Must be one of: ${validProviders.join(', ')}` },
          { status: 400 }
        );
      }
    }

    // Ensure only one primary account
    const primaryAccounts = accounts.filter(acc => acc.is_primary);
    if (primaryAccounts.length > 1) {
      return NextResponse.json(
        { error: "Only one account can be marked as primary" },
        { status: 400 }
      );
    }

    // If no primary, mark first as primary
    if (primaryAccounts.length === 0 && accounts.length > 0) {
      accounts[0].is_primary = true;
    }

    // Update vendor
    const { data: updatedVendor, error: updateError } = await supabaseAdmin
      .from("vendors")
      .update({
        mobile_money_accounts: accounts,
      })
      .eq("id", vendorId)
      .select()
      .single();

    if (updateError) {
      console.error("Error updating mobile money accounts:", updateError);
      return NextResponse.json(
        { error: "Failed to update mobile money accounts", details: updateError.message },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      vendorId: updatedVendor.id,
      mobileMoneyAccounts: updatedVendor.mobile_money_accounts,
    });
  } catch (error) {
    console.error("Unexpected error updating mobile money accounts:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
