import { auth } from '@clerk/nextjs/server'
import { createClient, type SupabaseClient } from '@supabase/supabase-js'

/**
 * Server-side admin client (bypasses RLS via service role).
 * Use only for trusted writes from server actions / route handlers.
 */
export function createSupabaseAdminClient(): SupabaseClient {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY
  if (!url || !key) {
    throw new Error('Missing NEXT_PUBLIC_SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY')
  }
  return createClient(url, key, {
    auth: { autoRefreshToken: false, persistSession: false },
  })
}

/**
 * Server-side Clerk-authenticated client (subject to RLS).
 * The Clerk JWT 'supabase' template carries the user's sub claim, which
 * RLS policies resolve to public.users.id via requesting_user_id().
 * Vendor scope is then enforced through vendor_memberships joins.
 */
export async function createClerkSupabaseServerClient(): Promise<SupabaseClient> {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL
  const key = process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY
  if (!url || !key) {
    throw new Error(
      'Missing NEXT_PUBLIC_SUPABASE_URL or NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY',
    )
  }
  const { getToken } = await auth()
  const token = await getToken({ template: 'supabase' })
  return createClient(url, key, {
    auth: { persistSession: false, autoRefreshToken: false },
    global: { headers: token ? { Authorization: `Bearer ${token}` } : {} },
  })
}
