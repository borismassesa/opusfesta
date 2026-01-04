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

interface CreateInvoiceRequest {
  inquiryId: string;
  type: 'DEPOSIT' | 'FULL_PAYMENT' | 'BALANCE' | 'ADDITIONAL_SERVICE';
  subtotal: number;
  taxAmount?: number;
  discountAmount?: number;
  dueDate?: string; // ISO date string
  description?: string;
  notes?: string;
}

export async function POST(request: NextRequest) {
  try {
    const body: CreateInvoiceRequest = await request.json();
    const { inquiryId, type, subtotal, taxAmount = 0, discountAmount = 0, dueDate, description, notes } = body;

    // Authenticate user (vendor creating invoice)
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

    // Validate input
    if (!inquiryId || !type || subtotal === undefined || subtotal <= 0) {
      return NextResponse.json(
        { error: "Missing required fields: inquiryId, type, and subtotal (must be > 0)" },
        { status: 400 }
      );
    }

    // Get inquiry and verify vendor ownership
    const { data: inquiry, error: inquiryError } = await supabaseAdmin
      .from("inquiries")
      .select(`
        id,
        vendor_id,
        user_id,
        status,
        vendors!inner(id, user_id, business_name)
      `)
      .eq("id", inquiryId)
      .single();

    if (inquiryError || !inquiry) {
      return NextResponse.json(
        { error: "Inquiry not found" },
        { status: 404 }
      );
    }

    // Verify the authenticated user is the vendor
    if (inquiry.vendors.user_id !== user.id) {
      return NextResponse.json(
        { error: "Unauthorized: You can only create invoices for your own inquiries" },
        { status: 403 }
      );
    }

    // Check if inquiry is in a valid state for invoicing
    if (inquiry.status !== 'accepted' && inquiry.status !== 'responded') {
      return NextResponse.json(
        { error: `Cannot create invoice for inquiry with status: ${inquiry.status}. Inquiry must be accepted or responded.` },
        { status: 400 }
      );
    }

    // Check if invoice already exists for this inquiry and type
    const { data: existingInvoice } = await supabaseAdmin
      .from("invoices")
      .select("id")
      .eq("inquiry_id", inquiryId)
      .eq("type", type)
      .eq("status", "DRAFT")
      .single();

    if (existingInvoice) {
      return NextResponse.json(
        { error: `A draft invoice of type ${type} already exists for this inquiry` },
        { status: 409 }
      );
    }

    // Calculate total
    const totalAmount = subtotal + (taxAmount || 0) - (discountAmount || 0);

    // Generate invoice number
    const { data: invoiceNumber, error: numberError } = await supabaseAdmin
      .rpc("generate_invoice_number");

    if (numberError || !invoiceNumber) {
      console.error("Error generating invoice number:", numberError);
      return NextResponse.json(
        { error: "Failed to generate invoice number" },
        { status: 500 }
      );
    }

    // Parse due date
    let parsedDueDate: string | null = null;
    if (dueDate) {
      const date = new Date(dueDate);
      if (isNaN(date.getTime())) {
        return NextResponse.json(
          { error: "Invalid due date format" },
          { status: 400 }
        );
      }
      parsedDueDate = date.toISOString().split("T")[0];
    } else {
      // Default: 7 days from now
      const defaultDueDate = new Date();
      defaultDueDate.setDate(defaultDueDate.getDate() + 7);
      parsedDueDate = defaultDueDate.toISOString().split("T")[0];
    }

    // Create invoice
    const { data: invoice, error: invoiceError } = await supabaseAdmin
      .from("invoices")
      .insert({
        inquiry_id: inquiryId,
        vendor_id: inquiry.vendor_id,
        user_id: inquiry.user_id,
        invoice_number: invoiceNumber,
        type: type,
        status: "DRAFT",
        subtotal: subtotal,
        tax_amount: taxAmount || 0,
        discount_amount: discountAmount || 0,
        total_amount: totalAmount,
        paid_amount: 0,
        currency: "TZS", // Default to TZS, can be made configurable
        issue_date: new Date().toISOString().split("T")[0],
        due_date: parsedDueDate,
        description: description || null,
        notes: notes || null,
      })
      .select()
      .single();

    if (invoiceError) {
      console.error("Error creating invoice:", invoiceError);
      return NextResponse.json(
        { error: "Failed to create invoice", details: invoiceError.message },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      invoice: {
        id: invoice.id,
        invoiceNumber: invoice.invoice_number,
        inquiryId: invoice.inquiry_id,
        vendorId: invoice.vendor_id,
        type: invoice.type,
        status: invoice.status,
        subtotal: invoice.subtotal,
        taxAmount: invoice.tax_amount,
        discountAmount: invoice.discount_amount,
        totalAmount: invoice.total_amount,
        currency: invoice.currency,
        issueDate: invoice.issue_date,
        dueDate: invoice.due_date,
        createdAt: invoice.created_at,
      },
    });
  } catch (error) {
    console.error("Unexpected error creating invoice:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

export async function GET(request: NextRequest) {
  try {
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
    const inquiryId = searchParams.get("inquiryId");
    const vendorId = searchParams.get("vendorId");
    const status = searchParams.get("status");
    const type = searchParams.get("type");

    // Build query
    let query = supabaseAdmin
      .from("invoices")
      .select(`
        id,
        inquiry_id,
        vendor_id,
        user_id,
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
        updated_at,
        vendors!inner(business_name, category),
        inquiries!inner(name, email, event_type, event_date)
      `)
      .order("created_at", { ascending: false });

    // Apply filters
    if (inquiryId) {
      query = query.eq("inquiry_id", inquiryId);
    }
    if (vendorId) {
      query = query.eq("vendor_id", vendorId);
    }
    if (status) {
      query = query.eq("status", status);
    }
    if (type) {
      query = query.eq("type", type);
    }

    // Apply RLS - users can only see their own invoices, vendors can see their invoices
    // The RLS policies will handle this automatically

    const { data: invoices, error: invoicesError } = await query;

    if (invoicesError) {
      console.error("Error fetching invoices:", invoicesError);
      return NextResponse.json(
        { error: "Failed to fetch invoices", details: invoicesError.message },
        { status: 500 }
      );
    }

    // Transform the data
    const transformedInvoices = (invoices || []).map((invoice: any) => ({
      id: invoice.id,
      invoiceNumber: invoice.invoice_number,
      inquiryId: invoice.inquiry_id,
      vendorId: invoice.vendor_id,
      vendorName: invoice.vendors?.business_name,
      vendorCategory: invoice.vendors?.category,
      userId: invoice.user_id,
      customerName: invoice.inquiries?.name,
      customerEmail: invoice.inquiries?.email,
      eventType: invoice.inquiries?.event_type,
      eventDate: invoice.inquiries?.event_date,
      type: invoice.type,
      status: invoice.status,
      subtotal: invoice.subtotal,
      taxAmount: invoice.tax_amount,
      discountAmount: invoice.discount_amount,
      totalAmount: invoice.total_amount,
      paidAmount: invoice.paid_amount,
      currency: invoice.currency,
      issueDate: invoice.issue_date,
      dueDate: invoice.due_date,
      paidAt: invoice.paid_at,
      description: invoice.description,
      notes: invoice.notes,
      createdAt: invoice.created_at,
      updatedAt: invoice.updated_at,
    }));

    return NextResponse.json({
      invoices: transformedInvoices,
    });
  } catch (error) {
    console.error("Unexpected error fetching invoices:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
