// Vendor team invitations: an owner/manager generates an 8-char invite code
// (invite), shares it out-of-band, and the invitee types it into the mobile
// app after signing in (redeem). Codes are single-use, expire in 7 days, and
// only their sha256 is stored (vendor_membership_invitations.code_hash) —
// the plaintext exists once, in the invite response.
//
// Redeem must run service-role: it inserts the vendor_memberships row and
// patches the redeemer's Clerk publicMetadata (userType 'vendor',
// onboardingComplete true) so onboarding routing sends them straight into
// the vendor tabs, skipping the wizard that would create them their own
// vendors row.

import "jsr:@supabase/functions-js/edge-runtime.d.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.49.0";

const SUPABASE_URL = Deno.env.get("SUPABASE_URL")!;
const SUPABASE_ANON_KEY = Deno.env.get("SUPABASE_ANON_KEY")!;
const SUPABASE_SERVICE_ROLE_KEY = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
const CLERK_SECRET_KEY = Deno.env.get("CLERK_SECRET_KEY")!;

const JSON_HEADERS = { "Content-Type": "application/json" };

// No I/L/O/0/1 — codes get read aloud and retyped.
const CODE_ALPHABET = "ABCDEFGHJKMNPQRSTUVWXYZ23456789";
const CODE_LENGTH = 8;

type RequestBody = {
  action?: "invite" | "redeem";
  vendorId?: string;
  email?: string;
  role?: "manager" | "staff";
  code?: string;
};

function errorResponse(message: string, status: number): Response {
  return new Response(JSON.stringify({ error: message }), { status, headers: JSON_HEADERS });
}

function generateCode(): string {
  const bytes = new Uint8Array(CODE_LENGTH);
  crypto.getRandomValues(bytes);
  return Array.from(bytes, (b) => CODE_ALPHABET[b % CODE_ALPHABET.length]).join("");
}

async function sha256Hex(value: string): Promise<string> {
  const digest = await crypto.subtle.digest("SHA-256", new TextEncoder().encode(value));
  return Array.from(new Uint8Array(digest), (b) => b.toString(16).padStart(2, "0")).join("");
}

function decodeJwtSub(token: string): string | null {
  try {
    const payload = JSON.parse(atob(token.split(".")[1].replace(/-/g, "+").replace(/_/g, "/")));
    return typeof payload.sub === "string" ? payload.sub : null;
  } catch {
    return null;
  }
}

async function fetchClerkUser(clerkUserId: string): Promise<Record<string, unknown> | null> {
  const res = await fetch(`https://api.clerk.com/v1/users/${clerkUserId}`, {
    headers: { Authorization: `Bearer ${CLERK_SECRET_KEY}` },
  });
  if (!res.ok) {
    console.error("[vendor-team-invite] Clerk user fetch failed", res.status, await res.text());
    return null;
  }
  return await res.json();
}

const sleep = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

// Same retry contract as complete-onboarding: routing gates on this metadata,
// so a silent failure would strand the redeemer — fail the request instead.
async function patchClerkMetadata(
  clerkUserId: string,
  publicMetadata: Record<string, unknown>,
  attempts = 4,
): Promise<boolean> {
  for (let attempt = 1; attempt <= attempts; attempt++) {
    try {
      const res = await fetch(`https://api.clerk.com/v1/users/${clerkUserId}`, {
        method: "PATCH",
        headers: { Authorization: `Bearer ${CLERK_SECRET_KEY}`, "Content-Type": "application/json" },
        body: JSON.stringify({ public_metadata: publicMetadata }),
      });
      if (res.ok) return true;
      if (res.status >= 400 && res.status < 500 && res.status !== 429) {
        console.error("[vendor-team-invite] Clerk metadata rejected", res.status, await res.text());
        return false;
      }
      console.error(`[vendor-team-invite] Clerk metadata failed (attempt ${attempt})`, res.status);
    } catch (err) {
      console.error(`[vendor-team-invite] Clerk API error (attempt ${attempt})`, err);
    }
    if (attempt < attempts) await sleep(250 * 2 ** (attempt - 1));
  }
  return false;
}

Deno.serve(async (req: Request) => {
  if (req.method === "OPTIONS") {
    return new Response(null, {
      headers: {
        "Access-Control-Allow-Origin": "*",
        "Access-Control-Allow-Methods": "POST, OPTIONS",
        "Access-Control-Allow-Headers": "Content-Type, Authorization",
      },
    });
  }
  if (req.method !== "POST") return errorResponse("Method not allowed", 405);

  try {
    const authHeader = req.headers.get("Authorization");
    if (!authHeader?.startsWith("Bearer ")) return errorResponse("Missing authorization", 401);
    const token = authHeader.slice(7);

    let body: RequestBody;
    try {
      body = await req.json();
    } catch {
      return errorResponse("Invalid JSON body", 400);
    }

    const caller = createClient(SUPABASE_URL, SUPABASE_ANON_KEY, {
      global: { headers: { Authorization: authHeader } },
    });
    const service = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY);

    if (body.action === "invite") {
      const { vendorId, role } = body;
      const email = body.email?.trim().toLowerCase();
      if (!vendorId || !email || (role !== "manager" && role !== "staff")) {
        return errorResponse("vendorId, email, and role ('manager'|'staff') are required", 400);
      }

      const { data: me } = await caller.from("users").select("id").maybeSingle();
      if (!me) return errorResponse("Unauthorized", 401);

      // Resolve the caller's role on this vendor: owning the vendors row
      // makes them owner; otherwise their own active membership row (RLS
      // permits self-reads).
      const { data: owned } = await caller
        .from("vendors")
        .select("id")
        .eq("id", vendorId)
        .eq("user_id", me.id)
        .maybeSingle();
      let callerRole: "owner" | "manager" | "staff" | null = owned ? "owner" : null;
      if (!callerRole) {
        const { data: membership } = await caller
          .from("vendor_memberships")
          .select("role")
          .eq("vendor_id", vendorId)
          .eq("user_id", me.id)
          .eq("status", "active")
          .maybeSingle();
        callerRole = (membership?.role as "owner" | "manager" | "staff" | undefined) ?? null;
      }
      if (callerRole !== "owner" && callerRole !== "manager") {
        return errorResponse("Only the owner or a manager can invite team members", 403);
      }
      // Managers can grow the team but not mint peers — owner-only.
      if (role === "manager" && callerRole !== "owner") {
        return errorResponse("Only the owner can invite a manager", 403);
      }

      const now = new Date().toISOString();
      await service
        .from("vendor_membership_invitations")
        .update({ status: "revoked", revoked_at: now })
        .eq("vendor_id", vendorId)
        .eq("email", email)
        .eq("status", "pending");

      const code = generateCode();
      const { error: insertError } = await service.from("vendor_membership_invitations").insert({
        vendor_id: vendorId,
        email,
        role,
        code_hash: await sha256Hex(code),
        invited_by: me.id,
      });
      if (insertError) {
        console.error("[vendor-team-invite] insert failed", insertError);
        return errorResponse("Failed to create invitation", 500);
      }

      return new Response(JSON.stringify({ code }), { status: 201, headers: JSON_HEADERS });
    }

    if (body.action === "redeem") {
      const code = body.code?.trim().toUpperCase();
      if (!code) return errorResponse("code is required", 400);

      const clerkUserId = decodeJwtSub(token);
      if (!clerkUserId) return errorResponse("Unauthorized", 401);

      // A couple account can't become a vendor member: onboarding routing is
      // single-valued on userType, so flipping it would sever their couple
      // profile and wedding website.
      const clerkUser = await fetchClerkUser(clerkUserId);
      if (!clerkUser) return errorResponse("Unauthorized", 401);
      const publicMetadata = (clerkUser.public_metadata ?? {}) as Record<string, unknown>;
      if (publicMetadata.userType === "couple") {
        return errorResponse(
          "This account is set up for wedding planning. Ask for the invite to be sent to a different account.",
          409,
        );
      }

      const { data: invitation } = await service
        .from("vendor_membership_invitations")
        .select("id, vendor_id, role, status, invited_by, expires_at")
        .eq("code_hash", await sha256Hex(code))
        .maybeSingle();
      if (!invitation) return errorResponse("This invite code is not valid", 404);
      if (invitation.status === "pending" && new Date(invitation.expires_at as string).getTime() < Date.now()) {
        await service
          .from("vendor_membership_invitations")
          .update({ status: "expired" })
          .eq("id", invitation.id);
        return errorResponse("This invite code has expired", 410);
      }

      // Resolve (or provision) the redeemer's users row — a brand-new signup
      // may beat the Clerk sync webhook here.
      let userId: string | null = null;
      const { data: me } = await caller.from("users").select("id").maybeSingle();
      if (me) {
        userId = me.id;
      } else {
        const emails = (clerkUser.email_addresses ?? []) as { id: string; email_address: string }[];
        const primaryId = clerkUser.primary_email_address_id as string | null;
        const email = emails.find((e) => e.id === primaryId)?.email_address ?? emails[0]?.email_address ?? null;
        const name =
          [clerkUser.first_name, clerkUser.last_name].filter(Boolean).join(" ") || null;
        const { data: inserted } = await service
          .from("users")
          .upsert(
            {
              id: crypto.randomUUID(),
              clerk_id: clerkUserId,
              email,
              name,
              avatar: (clerkUser.image_url as string | null) ?? null,
              role: "user",
              updated_at: new Date().toISOString(),
            },
            { onConflict: "clerk_id", ignoreDuplicates: true },
          )
          .select("id")
          .maybeSingle();
        userId = inserted?.id ?? null;
        if (!userId) {
          const { data: byClerk } = await service
            .from("users")
            .select("id")
            .eq("clerk_id", clerkUserId)
            .maybeSingle();
          userId = byClerk?.id ?? null;
        }
      }
      if (!userId) return errorResponse("Could not resolve your account", 500);

      if (invitation.status !== "pending") {
        // Idempotent retry: if this same user already holds the membership
        // (e.g. the earlier attempt inserted it but the Clerk metadata patch
        // failed), finish setup instead of rejecting the code.
        const { data: mine } = await service
          .from("vendor_memberships")
          .select("id")
          .eq("vendor_id", invitation.vendor_id)
          .eq("user_id", userId)
          .eq("status", "active")
          .maybeSingle();
        if (invitation.status !== "accepted" || !mine) {
          return errorResponse("This invite code is not valid", 404);
        }
      }

      // Multi-vendor membership isn't a supported product state.
      const { data: existingMembership } = await service
        .from("vendor_memberships")
        .select("vendor_id")
        .eq("user_id", userId)
        .eq("status", "active")
        .limit(1)
        .maybeSingle();
      if (existingMembership && existingMembership.vendor_id !== invitation.vendor_id) {
        return errorResponse("This account already belongs to another vendor team", 409);
      }

      const { error: membershipError } = await service.from("vendor_memberships").upsert(
        {
          vendor_id: invitation.vendor_id,
          user_id: userId,
          role: invitation.role,
          status: "active",
          invited_by: invitation.invited_by,
          updated_at: new Date().toISOString(),
        },
        { onConflict: "vendor_id,user_id" },
      );
      if (membershipError) {
        console.error("[vendor-team-invite] membership insert failed", membershipError);
        return errorResponse("Failed to join the team", 500);
      }

      const { error: acceptError } = await service
        .from("vendor_membership_invitations")
        .update({ status: "accepted", accepted_at: new Date().toISOString() })
        .eq("id", invitation.id);
      if (acceptError) console.error("[vendor-team-invite] accept update failed", acceptError.code);

      const patched = await patchClerkMetadata(clerkUserId, {
        ...publicMetadata,
        userType: "vendor",
        onboardingComplete: true,
      });
      if (!patched) {
        return errorResponse("Joined the team, but finishing setup failed — please retry", 500);
      }

      const { data: vendor } = await service
        .from("vendors")
        .select("business_name")
        .eq("id", invitation.vendor_id)
        .maybeSingle();

      return new Response(
        JSON.stringify({ vendorId: invitation.vendor_id, role: invitation.role, businessName: vendor?.business_name ?? null }),
        { headers: JSON_HEADERS },
      );
    }

    return errorResponse("action ('invite'|'redeem') is required", 400);
  } catch (err) {
    console.error("[vendor-team-invite] unhandled", err);
    return errorResponse("Internal server error", 500);
  }
});
