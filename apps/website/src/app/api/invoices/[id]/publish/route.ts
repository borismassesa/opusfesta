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

/**
 * Publish an invoice (change status from DRAFT to PENDING)
 * This makes the invoice visible to the customer and ready for payment
 */
export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const supabaseAdmin = getSupabaseAdmin();
    const { id: invoiceId } = await params;

    // Authenticate user (vendor)
    const user = await getAuthenticatedUser();
    if (!user) {
      return NextResponse.json(
        { error: "Authentication required" },
        { status: 401 }
      );
    }

    // Get invoice and verify vendor ownership
    const { data: invoice, error: invoiceError } = await supabaseAdmin
      .from("invoices")
      .select(`
        id,
        vendor_id,
        status
      `)
      .eq("id", invoiceId)
      .single();

    if (invoiceError || !invoice) {
      return NextResponse.json(
        { error: "Invoice not found" },
        { status: 404 }
      );
    }

    // Verify the authenticated user is the vendor
    const { data: vendor } = await supabaseAdmin
      .from("vendors")
      .select("user_id")
      .eq("id", invoice.vendor_id)
      .single();

    if (!vendor || vendor.user_id !== user.id) {
      return NextResponse.json(
        { error: "Unauthorized: You can only publish your own invoices" },
        { status: 403 }
      );
    }

    // Only allow publishing DRAFT invoices
    if (invoice.status !== 'DRAFT') {
      return NextResponse.json(
        { error: `Cannot publish invoice with status: ${invoice.status}. Only DRAFT invoices can be published.` },
        { status: 400 }
      );
    }

    // Update invoice status to PENDING
    const { data: updatedInvoice, error: updateError } = await supabaseAdmin
      .from("invoices")
      .update({ status: 'PENDING' })
      .eq("id", invoiceId)
      .select()
      .single();

    if (updateError) {
      console.error("Error publishing invoice:", updateError);
      return NextResponse.json(
        { error: "Failed to publish invoice", details: updateError.message },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      invoice: {
        id: updatedInvoice.id,
        invoiceNumber: updatedInvoice.invoice_number,
        status: updatedInvoice.status,
        updatedAt: updatedInvoice.updated_at,
      },
      message: "Invoice published successfully. Customer can now view and pay the invoice.",
    });
  } catch (error) {
    console.error("Unexpected error publishing invoice:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
