import { auth, currentUser } from "@clerk/nextjs/server";
import { createClient } from "@supabase/supabase-js";

/**
 * Shared helper for API route authentication using Clerk.
 * Replaces the old pattern of `supabaseAdmin.auth.getUser(token)`.
 *
 * Returns the Clerk user ID, Supabase UUID (from public.users), and email.
 * Returns null if the user is not authenticated.
 */

export interface AuthenticatedUser {
  /** Supabase UUID from public.users.id */
  id: string;
  /** Clerk user ID (e.g. user_2abc123) */
  clerkId: string;
  /** User email */
  email: string;
}

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
 * Authenticate the current request using Clerk and resolve the Supabase UUID.
 * Use this in API routes to replace the old `supabaseAdmin.auth.getUser(token)` pattern.
 * Never throws: returns null on auth provider errors so public APIs remain guest-safe.
 *
 * @returns The authenticated user info, or null if not authenticated
 */
export async function getAuthenticatedUser(): Promise<AuthenticatedUser | null> {
  try {
    const { userId: clerkUserId } = await auth();

    if (!clerkUserId) {
      return null;
    }

    const supabaseAdmin = getSupabaseAdmin();

    const { data: dbUser, error } = await supabaseAdmin
      .from("users")
      .select("id, email")
      .eq("clerk_id", clerkUserId)
      .single();

    if (error || !dbUser) {
      return null;
    }

    return {
      id: dbUser.id,
      clerkId: clerkUserId,
      email: dbUser.email,
    };
  } catch (authError) {
    console.warn("Auth error in getAuthenticatedUser:", authError);
    return null;
  }
}
