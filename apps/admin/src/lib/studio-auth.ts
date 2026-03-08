import { auth } from "@clerk/nextjs/server";
import { getSupabaseAdmin } from "@/lib/supabaseAdmin";

export const STUDIO_ROLES = ["owner", "admin", "staff", "viewer"] as const;
export type StudioRole = (typeof STUDIO_ROLES)[number];

const ROLE_RANK: Record<StudioRole, number> = {
  viewer: 1,
  staff: 2,
  admin: 3,
  owner: 4,
};

export interface StudioActorContext {
  userId: string;
  clerkId: string;
  email: string | null;
  role: StudioRole;
}

function normalizeWhitelistRole(input: string | null | undefined): StudioRole {
  if (input === "owner") return "owner";
  if (input === "admin") return "admin";
  if (input === "editor") return "staff";
  if (input === "viewer") return "viewer";
  if (input === "staff") return "staff";
  return "viewer";
}

export async function getStudioActorContext(): Promise<StudioActorContext | null> {
  const { userId: clerkUserId } = await auth();
  if (!clerkUserId) return null;

  const supabase = getSupabaseAdmin();
  const { data: userRow } = await supabase
    .from("users")
    .select("id, email, role")
    .eq("clerk_id", clerkUserId)
    .single();

  if (!userRow?.id) return null;

  const { data: whitelist } = await supabase
    .from("admin_whitelist")
    .select("role")
    .eq("user_id", userRow.id)
    .eq("is_active", true)
    .maybeSingle();

  let role: StudioRole = "viewer";
  if (whitelist?.role) {
    role = normalizeWhitelistRole(whitelist.role);
  } else if (userRow.role === "admin") {
    role = "admin";
  }

  return {
    userId: userRow.id,
    clerkId: clerkUserId,
    email: userRow.email ?? null,
    role,
  };
}

export async function requireStudioRole(minRole: StudioRole): Promise<StudioActorContext> {
  const actor = await getStudioActorContext();
  if (!actor) {
    throw new Error("UNAUTHORIZED");
  }

  if (ROLE_RANK[actor.role] < ROLE_RANK[minRole]) {
    throw new Error("FORBIDDEN");
  }

  return actor;
}
