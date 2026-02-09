import { Webhook } from "svix";
import { createClient } from "@supabase/supabase-js";
import { mapUserTypeToRole } from "../roles";
import type { UserType, UserRole } from "../types";
import { randomUUID } from "crypto";

interface ClerkEmailAddress {
  email_address: string;
  id: string;
}

interface ClerkWebhookUserData {
  id: string;
  email_addresses: ClerkEmailAddress[];
  primary_email_address_id: string;
  first_name: string | null;
  last_name: string | null;
  image_url: string | null;
  public_metadata: Record<string, unknown>;
  unsafe_metadata: Record<string, unknown>;
}

interface ClerkWebhookEvent {
  type: string;
  data: ClerkWebhookUserData;
}

function getSupabaseAdmin() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY;

  if (!url || !key) {
    throw new Error(
      "Missing NEXT_PUBLIC_SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY"
    );
  }

  return createClient(url, key, {
    auth: { autoRefreshToken: false, persistSession: false },
  });
}

function getPrimaryEmail(data: ClerkWebhookUserData): string {
  const primary = data.email_addresses.find(
    (e) => e.id === data.primary_email_address_id
  );
  return primary?.email_address || data.email_addresses[0]?.email_address || "";
}

function getFullName(data: ClerkWebhookUserData): string | null {
  const parts = [data.first_name, data.last_name].filter(Boolean);
  return parts.length > 0 ? parts.join(" ") : null;
}

function getUserRole(data: ClerkWebhookUserData): UserRole {
  // Check public_metadata first (set by admin or during migration)
  if (data.public_metadata?.role) {
    return data.public_metadata.role as UserRole;
  }

  // Check unsafe_metadata (set during signup, then promoted to public by backend)
  const userType = data.unsafe_metadata?.user_type as UserType | undefined;
  if (userType) {
    return mapUserTypeToRole(userType);
  }

  return "user";
}

/**
 * Handles Clerk webhook events and syncs to public.users table.
 * Must be called from an API route handler.
 */
export async function handleClerkWebhook(
  body: string,
  headers: {
    "svix-id": string | null;
    "svix-timestamp": string | null;
    "svix-signature": string | null;
  }
): Promise<{ success: boolean; error?: string }> {
  const webhookSecret = process.env.CLERK_WEBHOOK_SECRET;

  if (!webhookSecret) {
    console.error("Missing CLERK_WEBHOOK_SECRET");
    return { success: false, error: "Webhook secret not configured" };
  }

  // Verify webhook signature
  const wh = new Webhook(webhookSecret);
  let event: ClerkWebhookEvent;

  try {
    event = wh.verify(body, {
      "svix-id": headers["svix-id"] || "",
      "svix-timestamp": headers["svix-timestamp"] || "",
      "svix-signature": headers["svix-signature"] || "",
    }) as ClerkWebhookEvent;
  } catch (err) {
    console.error("Webhook signature verification failed:", err);
    return { success: false, error: "Invalid webhook signature" };
  }

  const supabase = getSupabaseAdmin();
  const { type, data } = event;

  try {
    switch (type) {
      case "user.created": {
        const email = getPrimaryEmail(data);
        const role = getUserRole(data);

        // Use upsert to be idempotent (webhook retries)
        const { error } = await supabase.from("users").upsert(
          {
            id: (data.public_metadata?.supabase_uuid as string) || randomUUID(),
            clerk_id: data.id,
            email,
            name: getFullName(data),
            avatar: data.image_url,
            role,
            password:
              "$2a$10$placeholder_password_not_used_with_clerk_auth",
            updated_at: new Date().toISOString(),
          },
          { onConflict: "clerk_id" }
        );

        if (error) {
          // Duplicate on email is OK - user already exists
          if (error.code === "23505" && error.message?.includes("email")) {
            // Update clerk_id on existing row instead
            const { error: updateErr } = await supabase
              .from("users")
              .update({ clerk_id: data.id, updated_at: new Date().toISOString() })
              .eq("email", email);

            if (updateErr) {
              console.error("Failed to update clerk_id on existing user:", updateErr);
              return { success: false, error: updateErr.message };
            }
            return { success: true };
          }

          console.error("Failed to create user from webhook:", error);
          return { success: false, error: error.message };
        }

        return { success: true };
      }

      case "user.updated": {
        const email = getPrimaryEmail(data);
        const role = getUserRole(data);

        const { error } = await supabase
          .from("users")
          .update({
            email,
            name: getFullName(data),
            avatar: data.image_url,
            role,
            updated_at: new Date().toISOString(),
          })
          .eq("clerk_id", data.id);

        if (error) {
          console.error("Failed to update user from webhook:", error);
          return { success: false, error: error.message };
        }

        return { success: true };
      }

      case "user.deleted": {
        const { error } = await supabase
          .from("users")
          .delete()
          .eq("clerk_id", data.id);

        if (error) {
          console.error("Failed to delete user from webhook:", error);
          return { success: false, error: error.message };
        }

        return { success: true };
      }

      default:
        // Ignore unhandled event types
        return { success: true };
    }
  } catch (err) {
    console.error("Webhook handler error:", err);
    return {
      success: false,
      error: err instanceof Error ? err.message : "Unknown error",
    };
  }
}
