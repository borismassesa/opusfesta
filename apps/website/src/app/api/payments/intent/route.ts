import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";
import { stripePaymentService } from "@/lib/payments/stripe";

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

interface CreatePaymentIntentRequest {
  invoiceId: string;
  inquiryId: string;
  amount: number; // Amount in cents
  currency: string;
  method?: 'stripe' | 'mpesa' | 'airtel_money' | 'tigo_pesa' | 'halo_pesa';
  customerEmail?: string;
  customerName?: string;
}

export async function POST(request: NextRequest) {
  try {
    const supabaseAdmin = getSupabaseAdmin();
    const body: CreatePaymentIntentRequest = await request.json();
    const { invoiceId, inquiryId, amount, currency, method = 'stripe', customerEmail, customerName } = body;

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

    // Get invoice
    const { data: invoice, error: invoiceError } = await supabaseAdmin
      .from("invoices")
      .select(`
        id,
        inquiry_id,
        vendor_id,
        user_id,
        total_amount,
        currency,
        status,
        invoice_number,
        inquiries!inner(id, name, email, phone)
      `)
      .eq("id", invoiceId)
      .single();

    if (invoiceError || !invoice) {
      return NextResponse.json(
        { error: "Invoice not found" },
        { status: 404 }
      );
    }

    // Verify user owns this invoice
    if (invoice.user_id !== user.id) {
      return NextResponse.json(
        { error: "Unauthorized: You can only pay for your own invoices" },
        { status: 403 }
      );
    }

    // Check invoice status
    if (invoice.status === 'PAID') {
      return NextResponse.json(
        { error: "Invoice is already paid" },
        { status: 400 }
      );
    }

    if (invoice.status === 'CANCELLED') {
      return NextResponse.json(
        { error: "Invoice has been cancelled" },
        { status: 400 }
      );
    }

    // Calculate amount to pay (use provided amount or remaining amount)
    const remainingAmount = parseFloat(invoice.total_amount.toString()) - parseFloat(invoice.paid_amount.toString());
    const amountToPay = amount ? amount / 100 : remainingAmount; // amount is in cents, convert to dollars
    
    if (amountToPay <= 0) {
      return NextResponse.json(
        { error: "Invoice is already fully paid" },
        { status: 400 }
      );
    }

    if (amountToPay > remainingAmount) {
      return NextResponse.json(
        { error: `Payment amount (${amountToPay}) exceeds remaining amount (${remainingAmount})` },
        { status: 400 }
      );
    }

    // Handle different payment methods
    if (method === 'stripe') {
      // Create Stripe payment intent
      const amountInCents = Math.round(amountToPay * 100); // Convert to cents
      
      const stripeResult = await stripePaymentService.createPaymentIntent({
        amount: amountInCents,
        currency: currency || invoice.currency || 'usd',
        invoiceId: invoice.id,
        inquiryId: inquiryId || invoice.inquiry_id,
        customerEmail: customerEmail || invoice.inquiries?.email,
        customerName: customerName || invoice.inquiries?.name,
        description: `Payment for invoice ${invoice.invoice_number}`,
        metadata: {
          invoice_number: invoice.invoice_number,
        },
      });

      if (!stripeResult.success) {
        return NextResponse.json(
          { error: stripeResult.error || "Failed to create payment intent" },
          { status: 500 }
        );
      }

      // Create payment record
      const { data: payment, error: paymentError } = await supabaseAdmin
        .from("payments")
        .insert({
          invoice_id: invoice.id,
          inquiry_id: inquiryId || invoice.inquiry_id,
          user_id: user.id,
          vendor_id: invoice.vendor_id,
          amount: amountToPay,
          currency: currency || invoice.currency || 'TZS',
          method: 'STRIPE_CARD',
          status: 'PENDING',
          provider: 'stripe',
          provider_ref: stripeResult.paymentIntentId,
          description: `Payment for invoice ${invoice.invoice_number}`,
          metadata: {
            payment_intent_id: stripeResult.paymentIntentId,
          },
        })
        .select()
        .single();

      if (paymentError) {
        console.error("Error creating payment record:", paymentError);
        return NextResponse.json(
          { error: "Failed to create payment record" },
          { status: 500 }
        );
      }

      return NextResponse.json({
        success: true,
        paymentId: payment.id,
        clientSecret: stripeResult.clientSecret,
        paymentIntentId: stripeResult.paymentIntentId,
        amount: amountToPay,
        currency: currency || invoice.currency,
      });
    } else {
      // Mobile money methods (MPESA, Airtel Money, etc.)
      // These will be handled by Africa's Talking
      return NextResponse.json(
        { error: "Mobile money payments will be implemented via Africa's Talking" },
        { status: 501 }
      );
    }
  } catch (error) {
    console.error("Unexpected error creating payment intent:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
