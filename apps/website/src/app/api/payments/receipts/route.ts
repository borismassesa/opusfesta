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

interface CreateReceiptRequest {
  paymentId: string;
  invoiceId: string;
  inquiryId?: string;
  receiptImageUrl: string;
  receiptNumber: string;
  paymentProvider: string;
  phoneNumber: string;
  amount: number;
  currency: string;
  paymentDate?: string;
  notes?: string;
}

/**
 * POST /api/payments/receipts
 * Submit a payment receipt for verification
 */
export async function POST(request: NextRequest) {
  try {
    const supabaseAdmin = getSupabaseAdmin();
    const body: CreateReceiptRequest = await request.json();
    const {
      paymentId,
      invoiceId,
      inquiryId,
      receiptImageUrl,
      receiptNumber,
      paymentProvider,
      phoneNumber,
      amount,
      currency,
      paymentDate,
      notes,
    } = body;

    // Authenticate user
    const user = await getAuthenticatedUser();
    if (!user) {
      return NextResponse.json(
        { error: "Authentication required" },
        { status: 401 }
      );
    }

    // Validate input
    if (!paymentId || !invoiceId || !receiptImageUrl || !receiptNumber || !paymentProvider || !phoneNumber || !amount) {
      return NextResponse.json(
        { error: "Missing required fields" },
        { status: 400 }
      );
    }

    // Get payment and verify ownership
    const { data: payment, error: paymentError } = await supabaseAdmin
      .from("payments")
      .select(`
        id,
        invoice_id,
        vendor_id,
        user_id,
        amount,
        status
      `)
      .eq("id", paymentId)
      .single();

    if (paymentError || !payment) {
      return NextResponse.json(
        { error: "Payment not found" },
        { status: 404 }
      );
    }

    // Verify user owns this payment
    if (payment.user_id !== user.id) {
      return NextResponse.json(
        { error: "Unauthorized: You can only submit receipts for your own payments" },
        { status: 403 }
      );
    }

    // Check if payment already has a verified receipt
    if (payment.status === "SUCCEEDED") {
      return NextResponse.json(
        { error: "This payment has already been verified" },
        { status: 400 }
      );
    }

    // Check if receipt already exists for this payment
    const { data: existingReceipt } = await supabaseAdmin
      .from("payment_receipts")
      .select("id, status")
      .eq("payment_id", paymentId)
      .eq("status", "verified")
      .single();

    if (existingReceipt) {
      return NextResponse.json(
        { error: "A verified receipt already exists for this payment" },
        { status: 409 }
      );
    }

    // Parse payment date
    let parsedPaymentDate: string | null = null;
    if (paymentDate) {
      const date = new Date(paymentDate);
      if (isNaN(date.getTime())) {
        return NextResponse.json(
          { error: "Invalid payment date format" },
          { status: 400 }
        );
      }
      parsedPaymentDate = date.toISOString().split("T")[0];
    }

    // Create receipt record
    const { data: receipt, error: receiptError } = await supabaseAdmin
      .from("payment_receipts")
      .insert({
        payment_id: paymentId,
        invoice_id: invoiceId,
        inquiry_id: inquiryId || null,
        vendor_id: payment.vendor_id,
        user_id: user.id,
        receipt_image_url: receiptImageUrl,
        receipt_number: receiptNumber,
        payment_provider: paymentProvider,
        phone_number: phoneNumber,
        amount: amount,
        currency: currency || "TZS",
        payment_date: parsedPaymentDate,
        status: "pending",
        metadata: {
          submitted_at: new Date().toISOString(),
          notes: notes || null,
        },
      })
      .select()
      .single();

    if (receiptError) {
      console.error("Error creating receipt:", receiptError);
      return NextResponse.json(
        { error: "Failed to create receipt", details: receiptError.message },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      receipt: {
        id: receipt.id,
        paymentId: receipt.payment_id,
        status: receipt.status,
        createdAt: receipt.created_at,
      },
      message: "Receipt submitted successfully. The vendor will review and verify your payment.",
    });
  } catch (error) {
    console.error("Unexpected error creating receipt:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

/**
 * GET /api/payments/receipts
 * Get receipts (filtered by user, vendor, or admin)
 */
export async function GET(request: NextRequest) {
  try {
    const supabaseAdmin = getSupabaseAdmin();
    // Authenticate user
    const user = await getAuthenticatedUser();
    if (!user) {
      return NextResponse.json(
        { error: "Authentication required" },
        { status: 401 }
      );
    }

    // Get query parameters
    const { searchParams } = new URL(request.url);
    const paymentId = searchParams.get("paymentId");
    const invoiceId = searchParams.get("invoiceId");
    const status = searchParams.get("status");

    // Build query
    let query = supabaseAdmin
      .from("payment_receipts")
      .select(`
        id,
        payment_id,
        invoice_id,
        inquiry_id,
        vendor_id,
        user_id,
        receipt_image_url,
        receipt_number,
        payment_provider,
        phone_number,
        amount,
        currency,
        payment_date,
        status,
        verified_by,
        verified_at,
        verification_notes,
        rejection_reason,
        created_at,
        updated_at,
        payments!inner(id, amount, status, method),
        invoices!inner(invoice_number)
      `)
      .order("created_at", { ascending: false });

    // Apply filters
    if (paymentId) {
      query = query.eq("payment_id", paymentId);
    }
    if (invoiceId) {
      query = query.eq("invoice_id", invoiceId);
    }
    if (status) {
      query = query.eq("status", status);
    }

    // RLS policies will handle authorization automatically

    const { data: receipts, error: receiptsError } = await query;

    if (receiptsError) {
      console.error("Error fetching receipts:", receiptsError);
      return NextResponse.json(
        { error: "Failed to fetch receipts", details: receiptsError.message },
        { status: 500 }
      );
    }

    return NextResponse.json({
      receipts: (receipts || []).map((receipt: any) => ({
        id: receipt.id,
        paymentId: receipt.payment_id,
        invoiceId: receipt.invoice_id,
        invoiceNumber: receipt.invoices?.invoice_number,
        inquiryId: receipt.inquiry_id,
        receiptImageUrl: receipt.receipt_image_url,
        receiptNumber: receipt.receipt_number,
        paymentProvider: receipt.payment_provider,
        phoneNumber: receipt.phone_number,
        amount: receipt.amount,
        currency: receipt.currency,
        paymentDate: receipt.payment_date,
        status: receipt.status,
        verifiedBy: receipt.verified_by,
        verifiedAt: receipt.verified_at,
        verificationNotes: receipt.verification_notes,
        rejectionReason: receipt.rejection_reason,
        createdAt: receipt.created_at,
        updatedAt: receipt.updated_at,
      })),
    });
  } catch (error) {
    console.error("Unexpected error fetching receipts:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
