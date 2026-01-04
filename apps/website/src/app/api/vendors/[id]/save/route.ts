import { NextRequest, NextResponse } from "next/server";
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

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const supabaseAdmin = getSupabaseAdmin();
    const { id: vendorId } = await params;
    
    // Get authenticated user
    const authHeader = request.headers.get("authorization");
    if (!authHeader) {
      return NextResponse.json(
        { error: "Authentication required" },
        { status: 401 }
      );
    }

    // Extract user ID from auth token (you'll need to implement proper JWT verification)
    // For now, we'll use a simple approach - in production, verify the JWT properly
    const token = authHeader.replace("Bearer ", "");
    
    // Get user from Supabase auth
    const { data: { user }, error: authError } = await supabaseAdmin.auth.getUser(token);
    
    if (authError || !user) {
      return NextResponse.json(
        { error: "Invalid authentication" },
        { status: 401 }
      );
    }

    // Check if vendor exists
    const { data: vendor, error: vendorError } = await supabase
      .from("vendors")
      .select("id")
      .eq("id", vendorId)
      .single();

    if (vendorError || !vendor) {
      return NextResponse.json(
        { error: "Vendor not found" },
        { status: 404 }
      );
    }

    // Check if already saved
    const { data: existing } = await supabase
      .from("saved_vendors")
      .select("id")
      .eq("user_id", user.id)
      .eq("vendor_id", vendorId)
      .single();

    if (existing) {
      return NextResponse.json(
        { error: "Vendor already saved" },
        { status: 400 }
      );
    }

    // Save vendor
    const { data: saved, error: saveError } = await supabase
      .from("saved_vendors")
      .insert({
        user_id: user.id,
        vendor_id: vendorId,
        status: "saved",
      })
      .select()
      .single();

    if (saveError) {
      console.error("Save error:", saveError);
      return NextResponse.json(
        { error: "Failed to save vendor" },
        { status: 500 }
      );
    }

    // Increment vendor save count atomically
    await supabase.rpc("increment_vendor_save_count", {
      vendor_id_param: vendorId,
    });

    return NextResponse.json({
      success: true,
      saved,
    });
  } catch (error) {
    console.error("Unexpected error saving vendor:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id: vendorId } = await params;
    
    // Get authenticated user
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

    // Delete saved vendor
    const { error: deleteError } = await supabase
      .from("saved_vendors")
      .delete()
      .eq("user_id", user.id)
      .eq("vendor_id", vendorId);

    if (deleteError) {
      console.error("Delete error:", deleteError);
      return NextResponse.json(
        { error: "Failed to unsave vendor" },
        { status: 500 }
      );
    }

    // Decrement vendor save count atomically
    await supabase.rpc("decrement_vendor_save_count", {
      vendor_id_param: vendorId,
    });

    return NextResponse.json({
      success: true,
    });
  } catch (error) {
    console.error("Unexpected error unsaving vendor:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
