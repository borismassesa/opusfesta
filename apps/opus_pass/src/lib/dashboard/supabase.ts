import 'server-only'
import { createClient, type SupabaseClient } from '@supabase/supabase-js'

/**
 * Service-role Supabase client for the couple dashboard.
 *
 * Dashboard mutations run server-side in actions that have already resolved
 * and verified the signed-in couple's `users.id`, then scope every query by
 * `user_id`. RLS on these tables (owner-only) is defense-in-depth; the public
 * RSVP flow also uses this client but gates access on the per-guest token.
 *
 * Never import this from a Client Component.
 */
export function createDashboardClient(): SupabaseClient {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY
  if (!url || !key) {
    throw new Error('Missing NEXT_PUBLIC_SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY')
  }
  return createClient(url, key, {
    auth: { autoRefreshToken: false, persistSession: false },
  })
}
