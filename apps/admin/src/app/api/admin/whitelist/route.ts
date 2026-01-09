import { NextRequest, NextResponse } from "next/server";
import { getSupabaseAdmin } from "@/lib/supabaseAdmin";
import { getAllActiveAdmins, isEmailWhitelisted, getAdminWhitelistEntry } from "@/lib/adminWhitelist";

// Check if user is owner (only owners can manage whitelist)
async function isOwner(request: NextRequest): Promise<{ isOwner: boolean; userId?: string }> {
  const authHeader = request.headers.get("authorization");
  if (!authHeader) {
    return { isOwner: false };
  }

  const token = authHeader.replace("Bearer ", "");
  const supabaseAdmin = getSupabaseAdmin();
  const { data: { user }, error } = await supabaseAdmin.auth.getUser(token);

  if (error || !user) {
    return { isOwner: false };
  }

  const { data: userData } = await supabaseAdmin
    .from("users")
    .select("role")
    .eq("id", user.id)
    .single();

  return {
    isOwner: userData?.role === "owner",
    userId: user.id,
  };
}

// GET - List all admins in whitelist
export async function GET(request: NextRequest) {
  try {
    const ownerCheck = await isOwner(request);
    if (!ownerCheck.isOwner) {
      return NextResponse.json({ error: "Unauthorized. Only owners can view the whitelist." }, { status: 403 });
    }

    const admins = await getAllActiveAdmins();

    return NextResponse.json({ admins });
  } catch (error: any) {
    console.error("Error fetching admin whitelist:", error);
    return NextResponse.json(
      { error: "Failed to fetch admin whitelist", details: error.message },
      { status: 500 }
    );
  }
}

// POST - Add admin to whitelist
export async function POST(request: NextRequest) {
  try {
    const ownerCheck = await isOwner(request);
    if (!ownerCheck.isOwner) {
      return NextResponse.json({ error: "Unauthorized. Only owners can add admins." }, { status: 403 });
    }

    const body = await request.json();
    const { email, full_name, role = "admin", phone, notes } = body;

    if (!email || typeof email !== "string") {
      return NextResponse.json({ error: "Email is required" }, { status: 400 });
    }

    // Validate role
    if (!["owner", "admin", "editor", "viewer"].includes(role)) {
      return NextResponse.json({ error: "Invalid role. Must be owner, admin, editor, or viewer" }, { status: 400 });
    }

    // Check if already whitelisted
    const existing = await getAdminWhitelistEntry(email);
    if (existing) {
      return NextResponse.json({ error: "This email is already in the whitelist" }, { status: 400 });
    }

    // Try to find user_id from users table
    const supabaseAdmin = getSupabaseAdmin();
    const { data: userData } = await supabaseAdmin
      .from("users")
      .select("id, email, full_name, name")
      .eq("email", email.toLowerCase())
      .single();

    const user_id = userData?.id || null;
    const finalName = full_name || userData?.full_name || userData?.name || null;

    // Insert into whitelist
    const { data, error } = await supabaseAdmin
      .from("admin_whitelist")
      .insert({
        user_id,
        email: email.toLowerCase(),
        full_name: finalName,
        role,
        is_active: true,
        added_by: ownerCheck.userId,
        phone: phone || null,
        notes: notes || null,
      })
      .select()
      .single();

    if (error) {
      console.error("Error adding admin to whitelist:", error);
      return NextResponse.json(
        { error: "Failed to add admin to whitelist", details: error.message },
        { status: 500 }
      );
    }

    return NextResponse.json({ admin: data, message: "Admin added to whitelist successfully" });
  } catch (error: any) {
    console.error("Error in POST /api/admin/whitelist:", error);
    return NextResponse.json(
      { error: error.message || "Internal server error" },
      { status: 500 }
    );
  }
}

// PATCH - Update admin in whitelist
export async function PATCH(request: NextRequest) {
  try {
    const ownerCheck = await isOwner(request);
    if (!ownerCheck.isOwner) {
      return NextResponse.json({ error: "Unauthorized. Only owners can update admins." }, { status: 403 });
    }

    const body = await request.json();
    const { id, email, full_name, role, is_active, phone, notes } = body;

    if (!id && !email) {
      return NextResponse.json({ error: "Either id or email is required" }, { status: 400 });
    }

    const supabaseAdmin = getSupabaseAdmin();
    const updateData: any = {};

    if (full_name !== undefined) updateData.full_name = full_name;
    if (role !== undefined) {
      if (!["owner", "admin", "editor", "viewer"].includes(role)) {
        return NextResponse.json({ error: "Invalid role" }, { status: 400 });
      }
      updateData.role = role;
    }
    if (is_active !== undefined) updateData.is_active = is_active;
    if (phone !== undefined) updateData.phone = phone;
    if (notes !== undefined) updateData.notes = notes;

    const { data, error } = await supabaseAdmin
      .from("admin_whitelist")
      .update(updateData)
      .eq(id ? "id" : "email", id || email.toLowerCase())
      .select()
      .single();

    if (error) {
      console.error("Error updating admin whitelist:", error);
      return NextResponse.json(
        { error: "Failed to update admin", details: error.message },
        { status: 500 }
      );
    }

    return NextResponse.json({ admin: data, message: "Admin updated successfully" });
  } catch (error: any) {
    console.error("Error in PATCH /api/admin/whitelist:", error);
    return NextResponse.json(
      { error: error.message || "Internal server error" },
      { status: 500 }
    );
  }
}

// DELETE - Remove admin from whitelist
export async function DELETE(request: NextRequest) {
  try {
    const ownerCheck = await isOwner(request);
    if (!ownerCheck.isOwner) {
      return NextResponse.json({ error: "Unauthorized. Only owners can remove admins." }, { status: 403 });
    }

    const { searchParams } = new URL(request.url);
    const id = searchParams.get("id");
    const email = searchParams.get("email");

    if (!id && !email) {
      return NextResponse.json({ error: "Either id or email is required" }, { status: 400 });
    }

    const supabaseAdmin = getSupabaseAdmin();
    const { error } = await supabaseAdmin
      .from("admin_whitelist")
      .delete()
      .eq(id ? "id" : "email", id || email?.toLowerCase());

    if (error) {
      console.error("Error deleting admin from whitelist:", error);
      return NextResponse.json(
        { error: "Failed to remove admin", details: error.message },
        { status: 500 }
      );
    }

    return NextResponse.json({ message: "Admin removed from whitelist successfully" });
  } catch (error: any) {
    console.error("Error in DELETE /api/admin/whitelist:", error);
    return NextResponse.json(
      { error: error.message || "Internal server error" },
      { status: 500 }
    );
  }
}
