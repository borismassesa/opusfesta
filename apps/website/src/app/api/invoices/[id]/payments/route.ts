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
 * GET /api/invoices/[id]/payments
 * Get all payments for a specific invoice
 */
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const supabaseAdmin = getSupabaseAdmin();
    const { id: invoiceId } = await params;

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

    // Get invoice to verify access
    const { data: invoice, error: invoiceError } = await supabaseAdmin
      .from("invoices")
      .select(`
        id,
        user_id,
        vendor_id
      `)
      .eq("id", invoiceId)
      .single();

    if (invoiceError || !invoice) {
      return NextResponse.json(
        { error: "Invoice not found" },
        { status: 404 }
      );
    }

    // Verify user has access
    const isOwner = invoice.user_id === user.id;
    
    const { data: vendor } = await supabaseAdmin
      .from("vendors")
      .select("user_id")
      .eq("id", invoice.vendor_id)
      .single();
    
    const isVendor = vendor?.user_id === user.id;

    if (!isOwner && !isVendor) {
      const { data: userData } = await supabaseAdmin
        .from("users")
        .select("role")
        .eq("id", user.id)
        .single();

      if (userData?.role !== "admin") {
        return NextResponse.json(
          { error: "Unauthorized" },
          { status: 403 }
        );
      }
    }

    // Get all payments for this invoice
    const { data: payments, error: paymentsError } = await supabaseAdmin
      .from("payments")
      .select(`
        id,
        invoice_id,
        inquiry_id,
        user_id,
        vendor_id,
        amount,
        currency,
        method,
        status,
        provider,
        provider_ref,
        provider_metadata,
        processed_at,
        failure_reason,
        refund_amount,
        refunded_at,
        description,
        metadata,
        created_at,
        updated_at
      `)
      .eq("invoice_id", invoiceId)
      .order("created_at", { ascending: false });

    if (paymentsError) {
      console.error("Error fetching payments:", paymentsError);
      return NextResponse.json(
        { error: "Failed to fetch payments", details: paymentsError.message },
        { status: 500 }
      );
    }

    // Calculate totals
    const totalPaid = (payments || [])
      .filter((p: any) => p.status === 'SUCCEEDED')
      .reduce((sum: number, p: any) => sum + parseFloat(p.amount.toString()), 0);

    const totalRefunded = (payments || [])
      .filter((p: any) => p.status === 'REFUNDED' || p.status === 'PARTIALLY_REFUNDED')
      .reduce((sum: number, p: any) => sum + parseFloat((p.refund_amount || 0).toString()), 0);

    const pendingPayments = (payments || []).filter((p: any) => 
      p.status === 'PENDING' || p.status === 'PROCESSING'
    );

    return NextResponse.json({
      invoiceId,
      payments: (payments || []).map((payment: any) => ({
        id: payment.id,
        invoiceId: payment.invoice_id,
        inquiryId: payment.inquiry_id,
        amount: payment.amount,
        currency: payment.currency,
        method: payment.method,
        status: payment.status,
        provider: payment.provider,
        providerRef: payment.provider_ref,
        processedAt: payment.processed_at,
        failureReason: payment.failure_reason,
        refundAmount: payment.refund_amount,
        refundedAt: payment.refunded_at,
        description: payment.description,
        createdAt: payment.created_at,
        updatedAt: payment.updated_at,
      })),
      summary: {
        totalPayments: payments?.length || 0,
        totalPaid,
        totalRefunded,
        netPaid: totalPaid - totalRefunded,
        pendingCount: pendingPayments.length,
        pendingAmount: pendingPayments.reduce((sum: number, p: any) => 
          sum + parseFloat(p.amount.toString()), 0
        ),
      },
    });
  } catch (error) {
    console.error("Unexpected error fetching invoice payments:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
