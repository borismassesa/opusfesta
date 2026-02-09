import { NextResponse } from "next/server";
import { auth, clerkClient } from "@clerk/nextjs/server";
import { createClient } from "@supabase/supabase-js";
import { randomUUID } from "crypto";

function getSupabaseAdmin() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!url || !key) {
    throw new Error("Missing Supabase env vars");
  }
  return createClient(url, key, {
    auth: { autoRefreshToken: false, persistSession: false },
  });
}

async function getPortalAccess(supabase: ReturnType<typeof createClient>, dbUserId: string, userRole: string) {
  // Look up vendor membership
  const { data: memberships } = await supabase
    .from("vendor_memberships")
    .select(`
      role,
      vendor:vendors (
        id,
        slug,
        business_name,
        onboarding_status,
        suspension_reason
      )
    `)
    .eq("user_id", dbUserId)
    .eq("status", "active");

  let vendor: { id: string; slug: string; business_name: string; onboarding_status?: string; suspension_reason?: string | null } | null = null;
  let membershipRole: string | null = null;

  if (memberships?.length) {
    const rolePriority: Record<string, number> = { owner: 0, manager: 1, staff: 2 };
    const sorted = memberships
      .map((row: any) => {
        const v = Array.isArray(row.vendor) ? row.vendor[0] : row.vendor;
        if (!row.role || !v?.id) return null;
        return { role: row.role, vendor: v };
      })
      .filter(Boolean)
      .sort((a: any, b: any) => (rolePriority[a.role] ?? 9) - (rolePriority[b.role] ?? 9));

    if (sorted[0]) {
      vendor = sorted[0].vendor;
      membershipRole = sorted[0].role;
    }
  }

  // Fallback: check vendors table directly
  if (!vendor) {
    const { data: directVendor } = await supabase
      .from("vendors")
      .select("id, slug, business_name, onboarding_status, suspension_reason")
      .eq("user_id", dbUserId)
      .maybeSingle();

    if (directVendor) {
      vendor = directVendor;
      membershipRole = "owner";
    }
  }

  return {
    dbUserId,
    role: userRole,
    vendor: vendor ? { id: vendor.id, slug: vendor.slug || "", business_name: vendor.business_name } : null,
    membershipRole,
    onboardingStatus: vendor?.onboarding_status ?? (vendor ? "active" : null),
    suspensionReason: vendor?.suspension_reason ?? null,
  };
}

export async function POST() {
  try {
    const { userId } = await auth();
    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const clerk = await clerkClient();
    const clerkUser = await clerk.users.getUser(userId);

    const email =
      clerkUser.emailAddresses.find(
        (e) => e.id === clerkUser.primaryEmailAddressId
      )?.emailAddress ||
      clerkUser.emailAddresses[0]?.emailAddress ||
      "";

    const name = [clerkUser.firstName, clerkUser.lastName]
      .filter(Boolean)
      .join(" ") || null;

    // Determine role from metadata
    const role =
      (clerkUser.publicMetadata?.role as string) ||
      (() => {
        const userType = clerkUser.unsafeMetadata?.user_type as string;
        if (userType === "vendor") return "vendor";
        if (userType === "admin") return "admin";
        return "user";
      })();

    const supabase = getSupabaseAdmin();

    // Check if user already exists
    const { data: existing } = await supabase
      .from("users")
      .select("id, role")
      .eq("clerk_id", userId)
      .maybeSingle();

    if (existing) {
      const access = await getPortalAccess(supabase, existing.id, existing.role);
      return NextResponse.json({ user: existing, created: false, access });
    }

    // Check by email (user may exist from before Clerk migration)
    const { data: byEmail } = await supabase
      .from("users")
      .select("id, role")
      .eq("email", email)
      .maybeSingle();

    if (byEmail) {
      // Link clerk_id to existing user
      await supabase
        .from("users")
        .update({ clerk_id: userId, updated_at: new Date().toISOString() })
        .eq("id", byEmail.id);
      const access = await getPortalAccess(supabase, byEmail.id, byEmail.role);
      return NextResponse.json({ user: byEmail, created: false, access });
    }

    // Create new user
    const { data: newUser, error } = await supabase
      .from("users")
      .insert({
        id: randomUUID(),
        clerk_id: userId,
        email,
        name,
        avatar: clerkUser.imageUrl,
        role,
        password: "$2a$10$placeholder_password_not_used_with_clerk_auth",
        updated_at: new Date().toISOString(),
      })
      .select("id, role")
      .single();

    if (error) {
      console.error("Failed to create user:", error);
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    const access = await getPortalAccess(supabase, newUser.id, newUser.role);
    return NextResponse.json({ user: newUser, created: true, access });
  } catch (err) {
    console.error("ensure-user error:", err);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
