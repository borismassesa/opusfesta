import { NextRequest, NextResponse } from "next/server";
import { supabase } from "@/lib/supabaseClient";
import { createClient } from "@supabase/supabase-js";
import { stripePaymentService } from "@/lib/payments/stripe";

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

interface UpdatePaymentRequest {
  status?: 'PENDING' | 'PROCESSING' | 'SUCCEEDED' | 'FAILED' | 'CANCELLED' | 'REFUNDED' | 'PARTIALLY_REFUNDED';
  failureReason?: string;
  refundAmount?: number;
  providerMetadata?: Record<string, any>;
}

/**
 * GET /api/payments/[id]
 * Get payment details
 */
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id: paymentId } = await params;

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

    // Get payment with related data
    const { data: payment, error: paymentError } = await supabaseAdmin
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
        invoices!inner(id, invoice_number, type, status, total_amount, paid_amount),
        vendors!inner(business_name, category),
        inquiries!left(name, email, event_type, event_date)
      `)
      .eq("id", paymentId)
      .single();

    if (paymentError || !payment) {
      return NextResponse.json(
        { error: "Payment not found" },
        { status: 404 }
      );
    }

    // Verify user has access
    const isOwner = payment.user_id === user.id;
    
    const { data: vendor } = await supabaseAdmin
      .from("vendors")
      .select("user_id")
      .eq("id", payment.vendor_id)
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

    return NextResponse.json({
      payment: {
        id: payment.id,
        invoiceId: payment.invoice_id,
        invoiceNumber: payment.invoices?.invoice_number,
        invoiceType: payment.invoices?.type,
        invoiceStatus: payment.invoices?.status,
        invoiceTotal: payment.invoices?.total_amount,
        invoicePaid: payment.invoices?.paid_amount,
        inquiryId: payment.inquiry_id,
        customerName: payment.inquiries?.name,
        customerEmail: payment.inquiries?.email,
        eventType: payment.inquiries?.event_type,
        eventDate: payment.inquiries?.event_date,
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
      },
    });
  } catch (error) {
    console.error("Unexpected error fetching payment:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

/**
 * PUT /api/payments/[id]
 * Update payment status (for manual updates or webhook processing)
 */
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id: paymentId } = await params;
    const body: UpdatePaymentRequest = await request.json();

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

    // Get payment
    const { data: payment, error: paymentError } = await supabaseAdmin
      .from("payments")
      .select(`
        id,
        invoice_id,
        vendor_id,
        status,
        amount
      `)
      .eq("id", paymentId)
      .single();

    if (paymentError || !payment) {
      return NextResponse.json(
        { error: "Payment not found" },
        { status: 404 }
      );
    }

    // Check if user is admin or vendor
    const { data: vendor } = await supabaseAdmin
      .from("vendors")
      .select("user_id")
      .eq("id", payment.vendor_id)
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
        { error: "Unauthorized: Only vendors and admins can update payment status" },
        { status: 403 }
      );
    }

    // Build update object
    const updateData: any = {
      updated_at: new Date().toISOString(),
    };

    if (body.status !== undefined) {
      // Validate status transition
      const validTransitions: Record<string, string[]> = {
        'PENDING': ['PROCESSING', 'SUCCEEDED', 'FAILED', 'CANCELLED'],
        'PROCESSING': ['SUCCEEDED', 'FAILED', 'CANCELLED'],
        'SUCCEEDED': ['REFUNDED', 'PARTIALLY_REFUNDED'],
        'FAILED': ['PENDING'], // Allow retry
        'CANCELLED': [],
        'REFUNDED': [],
        'PARTIALLY_REFUNDED': ['REFUNDED'],
      };

      const currentStatus = payment.status;
      const allowedStatuses = validTransitions[currentStatus] || [];

      if (!allowedStatuses.includes(body.status) && body.status !== currentStatus) {
        return NextResponse.json(
          { error: `Invalid status transition from ${currentStatus} to ${body.status}` },
          { status: 400 }
        );
      }

      updateData.status = body.status;

      // Set processed_at when payment succeeds
      if (body.status === 'SUCCEEDED' && payment.status !== 'SUCCEEDED') {
        updateData.processed_at = new Date().toISOString();
      }

      // Set refunded_at when refunded
      if ((body.status === 'REFUNDED' || body.status === 'PARTIALLY_REFUNDED') && 
          payment.status !== 'REFUNDED' && payment.status !== 'PARTIALLY_REFUNDED') {
        updateData.refunded_at = new Date().toISOString();
      }
    }

    if (body.failureReason !== undefined) {
      updateData.failure_reason = body.failureReason;
    }

    if (body.refundAmount !== undefined) {
      if (body.refundAmount < 0 || body.refundAmount > parseFloat(payment.amount.toString())) {
        return NextResponse.json(
          { error: "Refund amount must be between 0 and payment amount" },
          { status: 400 }
        );
      }
      updateData.refund_amount = body.refundAmount;
    }

    if (body.providerMetadata !== undefined) {
      updateData.provider_metadata = body.providerMetadata;
    }

    // Update payment
    const { data: updatedPayment, error: updateError } = await supabaseAdmin
      .from("payments")
      .update(updateData)
      .eq("id", paymentId)
      .select()
      .single();

    if (updateError) {
      console.error("Error updating payment:", updateError);
      return NextResponse.json(
        { error: "Failed to update payment", details: updateError.message },
        { status: 500 }
      );
    }

    // The trigger will automatically update the invoice paid_amount and status
    // No need to manually update it here

    return NextResponse.json({
      success: true,
      payment: {
        id: updatedPayment.id,
        status: updatedPayment.status,
        processedAt: updatedPayment.processed_at,
        refundAmount: updatedPayment.refund_amount,
        refundedAt: updatedPayment.refunded_at,
        updatedAt: updatedPayment.updated_at,
      },
    });
  } catch (error) {
    console.error("Unexpected error updating payment:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
