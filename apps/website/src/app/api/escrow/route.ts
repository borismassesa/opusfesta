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
 * GET /api/escrow
 * Get escrow holds (filtered by vendor, user, or admin)
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
    const vendorId = searchParams.get("vendorId");
    const inquiryId = searchParams.get("inquiryId");
    const status = searchParams.get("status");
    const workCompleted = searchParams.get("workCompleted");

    // Build query
    let query = supabaseAdmin
      .from("escrow_holds")
      .select(`
        id,
        payment_id,
        invoice_id,
        inquiry_id,
        vendor_id,
        user_id,
        total_amount,
        platform_fee,
        vendor_amount,
        currency,
        status,
        held_at,
        released_at,
        refunded_at,
        work_completed,
        work_completed_at,
        work_verified_by,
        work_verified_at,
        work_verification_notes,
        release_method,
        release_reason,
        created_at,
        updated_at,
        vendors!inner(business_name, category),
        payments!inner(amount, method, status),
        invoices!inner(invoice_number, total_amount)
      `)
      .order("created_at", { ascending: false });

    // Apply filters
    if (vendorId) {
      query = query.eq("vendor_id", vendorId);
    }
    if (inquiryId) {
      query = query.eq("inquiry_id", inquiryId);
    }
    if (status) {
      query = query.eq("status", status);
    }
    if (workCompleted !== null) {
      query = query.eq("work_completed", workCompleted === 'true');
    }

    // RLS policies will handle authorization

    const { data: holds, error: holdsError } = await query;

    if (holdsError) {
      console.error("Error fetching escrow holds:", holdsError);
      return NextResponse.json(
        { error: "Failed to fetch escrow holds", details: holdsError.message },
        { status: 500 }
      );
    }

    return NextResponse.json({
      holds: (holds || []).map((hold: any) => ({
        id: hold.id,
        paymentId: hold.payment_id,
        invoiceId: hold.invoice_id,
        invoiceNumber: hold.invoices?.invoice_number,
        inquiryId: hold.inquiry_id,
        vendorId: hold.vendor_id,
        vendorName: hold.vendors?.business_name,
        userId: hold.user_id,
        totalAmount: hold.total_amount,
        platformFee: hold.platform_fee,
        vendorAmount: hold.vendor_amount,
        currency: hold.currency,
        status: hold.status,
        heldAt: hold.held_at,
        releasedAt: hold.released_at,
        refundedAt: hold.refunded_at,
        workCompleted: hold.work_completed,
        workCompletedAt: hold.work_completed_at,
        workVerifiedBy: hold.work_verified_by,
        workVerifiedAt: hold.work_verified_at,
        workVerificationNotes: hold.work_verification_notes,
        releaseMethod: hold.release_method,
        releaseReason: hold.release_reason,
        createdAt: hold.created_at,
        updatedAt: hold.updated_at,
      })),
    });
  } catch (error) {
    console.error("Unexpected error fetching escrow holds:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
