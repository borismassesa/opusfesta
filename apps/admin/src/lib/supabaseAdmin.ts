import { createClient, SupabaseClient } from "@supabase/supabase-js";

/**
 * Get Supabase admin client with service role key
 * This client bypasses RLS and should only be used in server-side API routes
 */
export function getSupabaseAdmin(): SupabaseClient {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

  if (!supabaseUrl) {
    throw new Error(
      "Missing NEXT_PUBLIC_SUPABASE_URL environment variable. " +
      "Please add it to your .env.local file. " +
      "You can copy it from apps/website/.env.local or get it from your Supabase project dashboard."
    );
  }

  if (!serviceRoleKey) {
    throw new Error(
      "Missing SUPABASE_SERVICE_ROLE_KEY environment variable. " +
      "This is required for admin API routes. " +
      "Please add it to your .env.local file. " +
      "You can find it in your Supabase project dashboard under Settings > API > service_role key. " +
      "Note: This key should be kept secret and never exposed to the client."
    );
  }

  return createClient(supabaseUrl, serviceRoleKey, {
    auth: {
      autoRefreshToken: false,
      persistSession: false,
    },
  });
}
