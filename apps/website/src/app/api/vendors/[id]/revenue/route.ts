import { NextRequest, NextResponse } from "next/server";
import { supabase } from "@/lib/supabaseClient";
import { createClient } from "@supabase/supabase-js";

const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!,
  {
    auth: {
      autoRefreshToken: false,
      persistSession: false,
    },
  }
);

/**
 * GET /api/vendors/[id]/revenue
 * Get vendor revenue summary and history
 */
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
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

    // Verify user is the vendor owner or admin
    const { data: vendor } = await supabaseAdmin
      .from("vendors")
      .select("user_id")
      .eq("id", vendorId)
      .single();

    if (!vendor) {
      return NextResponse.json(
        { error: "Vendor not found" },
        { status: 404 }
      );
    }

    const isVendor = vendor.user_id === user.id;

    const { data: userData } = await supabaseAdmin
      .from("users")
      .select("role")
      .eq("id", user.id)
      .single();

    const isAdmin = userData?.role === "admin";

    if (!isVendor && !isAdmin) {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 403 }
      );
    }

    // Get query parameters for date range
    const { searchParams } = new URL(request.url);
    const startDate = searchParams.get("startDate");
    const endDate = searchParams.get("endDate");

    // Get revenue summary
    const { data: summary, error: summaryError } = await supabaseAdmin
      .rpc("get_vendor_revenue_summary", {
        vendor_uuid: vendorId,
        start_date: startDate || null,
        end_date: endDate || null,
      });

    if (summaryError) {
      console.error("Error fetching revenue summary:", summaryError);
      return NextResponse.json(
        { error: "Failed to fetch revenue summary", details: summaryError.message },
        { status: 500 }
      );
    }

    // Get detailed revenue history
    const { data: revenueHistory, error: historyError } = await supabaseAdmin
      .from("vendor_revenue")
      .select(`
        id,
        payment_id,
        invoice_id,
        inquiry_id,
        amount,
        currency,
        platform_fee,
        total_payment,
        transfer_status,
        transferred_at,
        payout_method,
        created_at,
        updated_at,
        payments!inner(
          id,
          amount,
          status,
          method,
          processed_at,
          invoices!inner(invoice_number)
        )
      `)
      .eq("vendor_id", vendorId)
      .order("created_at", { ascending: false })
      .limit(100);

    if (historyError) {
      console.error("Error fetching revenue history:", historyError);
      return NextResponse.json(
        { error: "Failed to fetch revenue history", details: historyError.message },
        { status: 500 }
      );
    }

    return NextResponse.json({
      vendorId,
      summary: summary?.[0] || {
        total_revenue: 0,
        total_platform_fees: 0,
        total_payments: 0,
        paid_out: 0,
        pending_payout: 0,
        payment_count: 0,
      },
      history: (revenueHistory || []).map((item: any) => ({
        id: item.id,
        paymentId: item.payment_id,
        invoiceId: item.invoice_id,
        invoiceNumber: item.payments?.invoices?.invoice_number,
        inquiryId: item.inquiry_id,
        amount: item.amount,
        currency: item.currency,
        platformFee: item.platform_fee,
        totalPayment: item.total_payment,
        transferStatus: item.transfer_status,
        transferredAt: item.transferred_at,
        payoutMethod: item.payout_method,
        paymentMethod: item.payments?.method,
        paymentStatus: item.payments?.status,
        paymentProcessedAt: item.payments?.processed_at,
        createdAt: item.created_at,
        updatedAt: item.updated_at,
      })),
    });
  } catch (error) {
    console.error("Unexpected error fetching vendor revenue:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
