import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";
import { stripePaymentService } from "@/lib/payments/stripe";
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

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const supabaseAdmin = getSupabaseAdmin();
    const { id: paymentId } = await params;

    // Authenticate user
    const user = await getAuthenticatedUser();
    if (!user) {
      return NextResponse.json(
        { error: "Authentication required" },
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
        invoices!inner(id, invoice_number, type, status),
        vendors!inner(business_name)
      `)
      .eq("id", paymentId)
      .single();

    if (paymentError || !payment) {
      return NextResponse.json(
        { error: "Payment not found" },
        { status: 404 }
      );
    }

    // Verify user has access (owner, vendor, or admin)
    const isOwner = payment.user_id === user.id;
    
    // Check if user is the vendor
    const { data: vendor } = await supabaseAdmin
      .from("vendors")
      .select("user_id")
      .eq("id", payment.vendor_id)
      .single();
    
    const isVendor = vendor?.user_id === user.id;

    if (!isOwner && !isVendor) {
      // Check if user is admin
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

    // If payment is pending and uses Stripe, check with Stripe
    const isStripePayment = payment.method === "STRIPE_CARD" || payment.method === "STRIPE_BANK";
    if (payment.status === "PENDING" && isStripePayment && payment.provider_ref) {
      const stripeIntent = await stripePaymentService.getPaymentIntent(payment.provider_ref);

      if (stripeIntent) {
        // Update payment status based on Stripe status
        let newStatus = payment.status;
        let processedAt = payment.processed_at;
        let failureReason = payment.failure_reason;

        if (stripeIntent.status === "succeeded") {
          newStatus = "SUCCEEDED";
          processedAt = new Date().toISOString();
        } else if (stripeIntent.status === "canceled") {
          newStatus = "CANCELLED";
        } else if (stripeIntent.status === "requires_payment_method" || stripeIntent.status === "payment_failed") {
          newStatus = "FAILED";
          failureReason = stripeIntent.last_payment_error?.message || "Payment failed";
        } else if (stripeIntent.status === "processing") {
          newStatus = "PROCESSING";
        }

        if (newStatus !== payment.status) {
          const updateData: any = {
            status: newStatus,
            updated_at: new Date().toISOString(),
          };

          if (processedAt) {
            updateData.processed_at = processedAt;
          }
          if (failureReason) {
            updateData.failure_reason = failureReason;
          }
          if (stripeIntent) {
            updateData.provider_metadata = stripeIntent;
          }

          await supabaseAdmin
            .from("payments")
            .update(updateData)
            .eq("id", payment.id);

          // Update payment object for response
          payment.status = newStatus;
          payment.processed_at = processedAt;
          payment.failure_reason = failureReason;
        }
      }
    }

    return NextResponse.json({
      payment: {
        id: payment.id,
        invoiceId: payment.invoice_id,
        invoiceNumber: payment.invoices?.invoice_number,
        invoiceType: payment.invoices?.type,
        invoiceStatus: payment.invoices?.status,
        inquiryId: payment.inquiry_id,
        userId: payment.user_id,
        vendorId: payment.vendor_id,
        vendorName: payment.vendors?.business_name,
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
      },
    });
  } catch (error) {
    console.error("Unexpected error fetching payment status:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
