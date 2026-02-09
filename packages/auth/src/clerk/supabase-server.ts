import { auth } from "@clerk/nextjs/server";
import { createClient, type SupabaseClient } from "@supabase/supabase-js";

/**
 * Server-side: Creates a Supabase client authenticated with Clerk JWT.
 * For use in API routes and Server Components.
 */
export async function createClerkSupabaseServerClient(): Promise<SupabaseClient> {
  const { getToken } = await auth();
  const clerkToken = await getToken({ template: "supabase" });

  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_DEFAULT_KEY!,
    {
      auth: {
        persistSession: false,
        autoRefreshToken: false,
      },
      global: {
        headers: {
          ...(clerkToken ? { Authorization: `Bearer ${clerkToken}` } : {}),
        },
      },
    }
  );
}

/**
 * Server-side: Creates Supabase admin client (service role, bypasses RLS).
 * For webhook handlers and admin operations.
 */
export function createSupabaseAdminClient(): SupabaseClient {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY;

  if (!url || !key) {
    throw new Error(
      "Missing NEXT_PUBLIC_SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY"
    );
  }

  return createClient(url, key, {
    auth: {
      autoRefreshToken: false,
      persistSession: false,
    },
  });
}
