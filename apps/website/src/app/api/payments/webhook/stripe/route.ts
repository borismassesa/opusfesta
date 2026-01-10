import { NextRequest, NextResponse } from "next/server";
import { stripePaymentService } from "@/lib/payments/stripe";
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

export async function POST(request: NextRequest) {
  try {
    const supabaseAdmin = getSupabaseAdmin();
    const body = await request.text();
    const signature = request.headers.get("stripe-signature");

    if (!signature) {
      return NextResponse.json(
        { error: "Missing stripe-signature header" },
        { status: 400 }
      );
    }

    // Verify webhook
    const event = await stripePaymentService.processWebhook(body, signature);

    if (!event) {
      return NextResponse.json(
        { error: "Invalid webhook signature" },
        { status: 400 }
      );
    }

    const paymentIntent = event.data.object as any;

    // Handle different event types
    switch (event.type) {
      case "payment_intent.succeeded":
        await handlePaymentSuccess(paymentIntent);
        break;

      case "payment_intent.payment_failed":
        await handlePaymentFailure(paymentIntent);
        break;

      case "payment_intent.canceled":
        await handlePaymentCancellation(paymentIntent);
        break;

      case "charge.refunded":
        await handleRefund(paymentIntent);
        break;

      default:
        console.log(`Unhandled event type: ${event.type}`);
    }

    return NextResponse.json({ received: true });
  } catch (error: any) {
    console.error("Stripe webhook error:", error);
    return NextResponse.json(
      { error: "Webhook processing failed" },
      { status: 500 }
    );
  }
}

async function handlePaymentSuccess(paymentIntent: any) {
  const invoiceId = paymentIntent.metadata?.invoice_id;

  if (!invoiceId) {
    console.error("No invoice_id in payment intent metadata");
    return;
  }

  // Find payment by provider_ref
  const { data: payment, error: paymentError } = await supabaseAdmin
    .from("payments")
    .select(`
      id,
      invoice_id,
      vendor_id,
      amount,
      currency
    `)
    .eq("provider_ref", paymentIntent.id)
    .single();

  if (paymentError || !payment) {
    console.error("Payment not found for Stripe payment intent:", paymentIntent.id);
    return;
  }

  // Update payment status
  await supabaseAdmin
    .from("payments")
    .update({
      status: "SUCCEEDED",
      processed_at: new Date().toISOString(),
      provider_metadata: paymentIntent,
    })
    .eq("id", payment.id);

  console.log(`Payment ${payment.id} marked as succeeded`);

  // The database trigger will automatically:
  // 1. Create escrow_hold record (funds held by OpusFesta)
  // 2. Calculate payment split (10% platform, 90% vendor)
  // 3. Create platform_revenue record (10% - collected immediately)
  // 4. Create vendor_revenue record (90% - held in escrow)
  
  // NOTE: Funds are NOT transferred to vendor immediately
  // Funds are held in escrow until work is completed and verified
  // Transfer happens when escrow is released via /api/escrow/[id]/release
}

async function handlePaymentFailure(paymentIntent: any) {
  const { data: payment } = await supabaseAdmin
    .from("payments")
    .select("id")
    .eq("provider_ref", paymentIntent.id)
    .single();

  if (payment) {
    await supabaseAdmin
      .from("payments")
      .update({
        status: "FAILED",
        failure_reason: paymentIntent.last_payment_error?.message || "Payment failed",
        provider_metadata: paymentIntent,
      })
      .eq("id", payment.id);
  }
}

async function handlePaymentCancellation(paymentIntent: any) {
  const { data: payment } = await supabaseAdmin
    .from("payments")
    .select("id")
    .eq("provider_ref", paymentIntent.id)
    .single();

  if (payment) {
    await supabaseAdmin
      .from("payments")
      .update({
        status: "CANCELLED",
        provider_metadata: paymentIntent,
      })
      .eq("id", payment.id);
  }
}

async function handleRefund(charge: any) {
  const paymentIntentId = charge.payment_intent;

  const { data: payment } = await supabaseAdmin
    .from("payments")
    .select("id, amount")
    .eq("provider_ref", paymentIntentId)
    .single();

  if (payment) {
    const refundAmount = charge.amount_refunded / 100; // Convert from cents

    await supabaseAdmin
      .from("payments")
      .update({
        refund_amount: refundAmount,
        refunded_at: new Date().toISOString(),
        status: refundAmount >= payment.amount ? "REFUNDED" : "PARTIALLY_REFUNDED",
        provider_metadata: charge,
      })
      .eq("id", payment.id);
  }
}
