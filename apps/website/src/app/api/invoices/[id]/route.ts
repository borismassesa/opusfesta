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

interface UpdateInvoiceRequest {
  status?: 'DRAFT' | 'PENDING' | 'PAID' | 'PARTIALLY_PAID' | 'OVERDUE' | 'CANCELLED';
  subtotal?: number;
  taxAmount?: number;
  discountAmount?: number;
  dueDate?: string;
  description?: string;
  notes?: string;
}

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
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

    // Get invoice with related data
    const { data: invoice, error: invoiceError } = await supabaseAdmin
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
        inquiries!inner(name, email, phone, event_type, event_date),
        payments(id, amount, method, status, created_at, processed_at)
      `)
      .eq("id", invoiceId)
      .single();

    if (invoiceError || !invoice) {
      return NextResponse.json(
        { error: "Invoice not found" },
        { status: 404 }
      );
    }

    // RLS will handle authorization, but we can add an extra check
    const isOwner = invoice.user_id === user.id;
    
    // Check if user is the vendor
    const { data: vendor } = await supabaseAdmin
      .from("vendors")
      .select("user_id")
      .eq("id", invoice.vendor_id)
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

    return NextResponse.json({
      invoice: {
        id: invoice.id,
        invoiceNumber: invoice.invoice_number,
        inquiryId: invoice.inquiry_id,
        vendorId: invoice.vendor_id,
        vendorName: invoice.vendors?.business_name,
        vendorCategory: invoice.vendors?.category,
        userId: invoice.user_id,
        customerName: invoice.inquiries?.name,
        customerEmail: invoice.inquiries?.email,
        customerPhone: invoice.inquiries?.phone,
        eventType: invoice.inquiries?.event_type,
        eventDate: invoice.inquiries?.event_date,
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
        payments: invoice.payments || [],
        createdAt: invoice.created_at,
        updatedAt: invoice.updated_at,
      },
    });
  } catch (error) {
    console.error("Unexpected error fetching invoice:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id: invoiceId } = await params;
    const body: UpdateInvoiceRequest = await request.json();

    // Authenticate user (vendor updating invoice)
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
        { error: "Unauthorized: You can only update your own invoices" },
        { status: 403 }
      );
    }

    // Don't allow updating paid invoices
    if (invoice.status === 'PAID') {
      return NextResponse.json(
        { error: "Cannot update a paid invoice" },
        { status: 400 }
      );
    }

    // Build update object
    const updateData: any = {};

    if (body.status !== undefined) {
      updateData.status = body.status;
    }
    if (body.subtotal !== undefined) {
      updateData.subtotal = body.subtotal;
      // Recalculate total if subtotal changes
      const currentInvoice = await supabaseAdmin
        .from("invoices")
        .select("tax_amount, discount_amount")
        .eq("id", invoiceId)
        .single();

      if (currentInvoice.data) {
        updateData.total_amount = body.subtotal + 
          (currentInvoice.data.tax_amount || 0) - 
          (currentInvoice.data.discount_amount || 0);
      }
    }
    if (body.taxAmount !== undefined) {
      updateData.tax_amount = body.taxAmount;
      // Recalculate total
      const currentInvoice = await supabaseAdmin
        .from("invoices")
        .select("subtotal, discount_amount")
        .eq("id", invoiceId)
        .single();

      if (currentInvoice.data) {
        updateData.total_amount = (currentInvoice.data.subtotal || 0) + 
          body.taxAmount - 
          (currentInvoice.data.discount_amount || 0);
      }
    }
    if (body.discountAmount !== undefined) {
      updateData.discount_amount = body.discountAmount;
      // Recalculate total
      const currentInvoice = await supabaseAdmin
        .from("invoices")
        .select("subtotal, tax_amount")
        .eq("id", invoiceId)
        .single();

      if (currentInvoice.data) {
        updateData.total_amount = (currentInvoice.data.subtotal || 0) + 
          (currentInvoice.data.tax_amount || 0) - 
          body.discountAmount;
      }
    }
    if (body.dueDate !== undefined) {
      const date = new Date(body.dueDate);
      if (isNaN(date.getTime())) {
        return NextResponse.json(
          { error: "Invalid due date format" },
          { status: 400 }
        );
      }
      updateData.due_date = date.toISOString().split("T")[0];
    }
    if (body.description !== undefined) {
      updateData.description = body.description;
    }
    if (body.notes !== undefined) {
      updateData.notes = body.notes;
    }

    // Update invoice
    const { data: updatedInvoice, error: updateError } = await supabaseAdmin
      .from("invoices")
      .update(updateData)
      .eq("id", invoiceId)
      .select()
      .single();

    if (updateError) {
      console.error("Error updating invoice:", updateError);
      return NextResponse.json(
        { error: "Failed to update invoice", details: updateError.message },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      invoice: {
        id: updatedInvoice.id,
        invoiceNumber: updatedInvoice.invoice_number,
        status: updatedInvoice.status,
        subtotal: updatedInvoice.subtotal,
        taxAmount: updatedInvoice.tax_amount,
        discountAmount: updatedInvoice.discount_amount,
        totalAmount: updatedInvoice.total_amount,
        dueDate: updatedInvoice.due_date,
        updatedAt: updatedInvoice.updated_at,
      },
    });
  } catch (error) {
    console.error("Unexpected error updating invoice:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
