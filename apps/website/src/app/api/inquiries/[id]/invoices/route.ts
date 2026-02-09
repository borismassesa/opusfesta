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
 * GET /api/inquiries/[id]/invoices
 * Get all invoices for a specific inquiry
 */
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const supabaseAdmin = getSupabaseAdmin();
    const { id: inquiryId } = await params;

    // Authenticate user
    const user = await getAuthenticatedUser();
    if (!user) {
      return NextResponse.json(
        { error: "Authentication required" },
        { status: 401 }
      );
    }

    // Get inquiry to verify access
    const { data: inquiry, error: inquiryError } = await supabaseAdmin
      .from("inquiries")
      .select(`
        id,
        user_id,
        vendor_id,
        status
      `)
      .eq("id", inquiryId)
      .single();

    if (inquiryError || !inquiry) {
      return NextResponse.json(
        { error: "Inquiry not found" },
        { status: 404 }
      );
    }

    // Verify user has access (owner, vendor, or admin)
    const isOwner = inquiry.user_id === user.id;
    
    const { data: vendor } = await supabaseAdmin
      .from("vendors")
      .select("user_id")
      .eq("id", inquiry.vendor_id)
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

    // Get all invoices for this inquiry
    const { data: invoices, error: invoicesError } = await supabaseAdmin
      .from("invoices")
      .select(`
        id,
        invoice_number,
        type,
        status,
        subtotal,
        tax_amount,
        discount_amount,
        total_amount,
        paid_amount,
        currency,
        issue_date,
        due_date,
        paid_at,
        description,
        notes,
        created_at,
        updated_at
      `)
      .eq("inquiry_id", inquiryId)
      .order("created_at", { ascending: false });

    if (invoicesError) {
      console.error("Error fetching invoices:", invoicesError);
      return NextResponse.json(
        { error: "Failed to fetch invoices", details: invoicesError.message },
        { status: 500 }
      );
    }

    // Get payments for each invoice
    const invoicesWithPayments = await Promise.all(
      (invoices || []).map(async (invoice: any) => {
        const { data: payments } = await supabaseAdmin
          .from("payments")
          .select(`
            id,
            amount,
            currency,
            method,
            status,
            processed_at,
            created_at
          `)
          .eq("invoice_id", invoice.id)
          .order("created_at", { ascending: false });

        return {
          ...invoice,
          payments: payments || [],
        };
      })
    );

    return NextResponse.json({
      inquiryId,
      inquiryStatus: inquiry.status,
      invoices: invoicesWithPayments.map((invoice: any) => ({
        id: invoice.id,
        invoiceNumber: invoice.invoice_number,
        type: invoice.type,
        status: invoice.status,
        subtotal: invoice.subtotal,
        taxAmount: invoice.tax_amount,
        discountAmount: invoice.discount_amount,
        totalAmount: invoice.total_amount,
        paidAmount: invoice.paid_amount,
        remainingAmount: parseFloat(invoice.total_amount.toString()) - parseFloat(invoice.paid_amount.toString()),
        currency: invoice.currency,
        issueDate: invoice.issue_date,
        dueDate: invoice.due_date,
        paidAt: invoice.paid_at,
        description: invoice.description,
        notes: invoice.notes,
        payments: invoice.payments.map((p: any) => ({
          id: p.id,
          amount: p.amount,
          currency: p.currency,
          method: p.method,
          status: p.status,
          processedAt: p.processed_at,
          createdAt: p.created_at,
        })),
        createdAt: invoice.created_at,
        updatedAt: invoice.updated_at,
      })),
    });
  } catch (error) {
    console.error("Unexpected error fetching inquiry invoices:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
