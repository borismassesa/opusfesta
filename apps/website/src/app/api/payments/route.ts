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

export async function GET(request: NextRequest) {
  try {
    const supabaseAdmin = getSupabaseAdmin();
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

    // Get query parameters
    const { searchParams } = new URL(request.url);
    const invoiceId = searchParams.get("invoiceId");
    const inquiryId = searchParams.get("inquiryId");
    const vendorId = searchParams.get("vendorId");
    const status = searchParams.get("status");
    const method = searchParams.get("method");

    // Build query
    let query = supabaseAdmin
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
        updated_at,
        invoices!inner(id, invoice_number, type, status, total_amount),
        vendors!inner(business_name, category)
      `)
      .order("created_at", { ascending: false });

    // Apply filters
    if (invoiceId) {
      query = query.eq("invoice_id", invoiceId);
    }
    if (inquiryId) {
      query = query.eq("inquiry_id", inquiryId);
    }
    if (vendorId) {
      query = query.eq("vendor_id", vendorId);
    }
    if (status) {
      query = query.eq("status", status);
    }
    if (method) {
      query = query.eq("method", method);
    }

    // RLS policies will handle authorization automatically
    // But we can add an extra check for user-specific payments
    if (!invoiceId && !inquiryId && !vendorId) {
      // If no specific filter, only show user's own payments
      query = query.eq("user_id", user.id);
    }

    const { data: payments, error: paymentsError } = await query;

    if (paymentsError) {
      console.error("Error fetching payments:", paymentsError);
      return NextResponse.json(
        { error: "Failed to fetch payments", details: paymentsError.message },
        { status: 500 }
      );
    }

    // Transform the data
    const transformedPayments = (payments || []).map((payment: any) => ({
      id: payment.id,
      invoiceId: payment.invoice_id,
      invoiceNumber: payment.invoices?.invoice_number,
      invoiceType: payment.invoices?.type,
      invoiceStatus: payment.invoices?.status,
      inquiryId: payment.inquiry_id,
      userId: payment.user_id,
      vendorId: payment.vendor_id,
      vendorName: payment.vendors?.business_name,
      vendorCategory: payment.vendors?.category,
      amount: payment.amount,
      currency: payment.currency,
      method: payment.method,
      status: payment.status,
      provider: payment.provider,
      providerRef: payment.provider_ref,
      providerMetadata: payment.provider_metadata,
      processedAt: payment.processed_at,
      failureReason: payment.failure_reason,
      refundAmount: payment.refund_amount,
      refundedAt: payment.refunded_at,
      description: payment.description,
      metadata: payment.metadata,
      createdAt: payment.created_at,
      updatedAt: payment.updated_at,
    }));

    return NextResponse.json({
      payments: transformedPayments,
      count: transformedPayments.length,
    });
  } catch (error) {
    console.error("Unexpected error fetching payments:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
