import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

/**
 * GET /api/platform/mobile-money
 * Get TheFesta's active mobile money accounts (public endpoint)
 */
export async function GET(request: NextRequest) {
  try {
    // Validate environment variables
    if (!process.env.NEXT_PUBLIC_SUPABASE_URL) {
      console.error("Missing NEXT_PUBLIC_SUPABASE_URL");
      return NextResponse.json(
        { error: "Server configuration error: Missing Supabase URL" },
        { status: 500 }
      );
    }

    if (!process.env.SUPABASE_SERVICE_ROLE_KEY) {
      console.error("Missing SUPABASE_SERVICE_ROLE_KEY");
      return NextResponse.json(
        { error: "Server configuration error: Missing Supabase service role key" },
        { status: 500 }
      );
    }

    // Create Supabase admin client inside the function to handle missing env vars gracefully
    const supabaseAdmin = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL,
      process.env.SUPABASE_SERVICE_ROLE_KEY,
      {
        auth: {
          autoRefreshToken: false,
          persistSession: false,
        },
      }
    );

    // Get active mobile money accounts
    const { data: accounts, error: accountsError } = await supabaseAdmin
      .from("platform_mobile_money_accounts")
      .select(`
        id,
        provider,
        lipa_namba,
        account_name,
        is_primary,
        description
      `)
      .eq("is_active", true)
      .order("is_primary", { ascending: false })
      .order("provider", { ascending: true });

    if (accountsError) {
      console.error("Error fetching mobile money accounts:", accountsError);
      // Check if table doesn't exist
      if (accountsError.code === '42P01' || accountsError.message?.includes('does not exist')) {
        return NextResponse.json(
          { 
            error: "Database table not found", 
            details: "The platform_mobile_money_accounts table does not exist. Please run the migration.",
            code: "TABLE_NOT_FOUND"
          },
          { status: 500 }
        );
      }
      return NextResponse.json(
        { 
          error: "Failed to fetch mobile money accounts", 
          details: accountsError.message,
          code: accountsError.code || "UNKNOWN_ERROR"
        },
        { status: 500 }
      );
    }

    return NextResponse.json({
      accounts: (accounts || []).map((account: any) => ({
        provider: account.provider,
        lipaNamba: account.lipa_namba,
        accountName: account.account_name,
        isPrimary: account.is_primary,
        description: account.description,
      })),
    });
  } catch (error: any) {
    console.error("Unexpected error fetching mobile money accounts:", error);
    return NextResponse.json(
      { 
        error: "Internal server error",
        details: error?.message || "Unknown error",
        stack: process.env.NODE_ENV === 'development' ? error?.stack : undefined
      },
      { status: 500 }
    );
  }
}
