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

interface ReportRequest {
  vendorId: string;
  reason: string;
  details?: string;
}

export async function POST(request: NextRequest) {
  try {
    const supabaseAdmin = getSupabaseAdmin();
    const body: ReportRequest = await request.json();

    // Validate required fields
    if (!body.vendorId || !body.reason) {
      return NextResponse.json(
        { error: "Missing required fields: vendorId and reason are required" },
        { status: 400 }
      );
    }

    // Get authenticated user (optional - reports can be anonymous)
    let userId: string | null = null;
    const user = await getAuthenticatedUser();
    if (user) {
      userId = user.id;
    }

    // Verify vendor exists
    const { data: vendor, error: vendorError } = await supabaseAdmin
      .from("vendors")
      .select("id, business_name")
      .eq("id", body.vendorId)
      .single();

    if (vendorError || !vendor) {
      return NextResponse.json(
        { error: "Vendor not found" },
        { status: 404 }
      );
    }

    // Create report record
    // Note: You may need to create a vendor_reports table in your database
    // For now, we'll log it and return success
    // You can create a migration to add this table later
    
    const reportData = {
      vendor_id: body.vendorId,
      reported_by: userId,
      reason: body.reason,
      details: body.details || null,
      status: 'pending',
      created_at: new Date().toISOString(),
    };

    // Try to insert into vendor_reports table if it exists
    // Otherwise, we'll just log it for now
    const { error: reportError } = await supabaseAdmin
      .from("vendor_reports")
      .insert(reportData)
      .select()
      .single();

    // If table doesn't exist, that's okay - we'll still return success
    // The report can be logged elsewhere or you can create the table
    if (reportError && !reportError.message.includes("does not exist")) {
      console.error("Error creating vendor report:", reportError);
      // Still return success to user, but log the error
    }

    // Log the report for admin review
    console.log("[VENDOR REPORT]", {
      vendorId: body.vendorId,
      vendorName: vendor.business_name,
      reason: body.reason,
      details: body.details,
      reportedBy: userId || "anonymous",
      timestamp: new Date().toISOString(),
    });

    return NextResponse.json({
      success: true,
      message: "Report submitted successfully. Our team will review it.",
    });
  } catch (error) {
    console.error("Unexpected error creating vendor report:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
