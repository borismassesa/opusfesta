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
 *
 * **Keyless / dev fallback:** If the Clerk app has no 'supabase' JWT template
 * configured (e.g. running in keyless dev mode), `getToken` throws a 404. We
 * log a warning and fall back to an unauthenticated client so the portal
 * boots — RLS will return zero rows, and `getCurrentVendor` resolves to
 * `no-membership`, which the dashboard already handles gracefully.
 *
 * Production deployments **must** configure the JWT template — otherwise no
 * vendor will ever see their data.
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
  let token: string | null = null
  try {
    token = await getToken({ template: 'supabase' })
  } catch (err) {
    const isMissingTemplate =
      err && typeof err === 'object' && 'status' in err && (err as { status: number }).status === 404
    if (!isMissingTemplate) throw err
    // Keyless dev fallback — see jsdoc above.
    console.warn(
      "[supabase] Clerk JWT template 'supabase' not found (404). Falling back to unauthenticated client. Configure the template at https://dashboard.clerk.com/last-active?path=jwt-templates to enable RLS-backed reads.",
    )
  }
  return createClient(url, key, {
    auth: { persistSession: false, autoRefreshToken: false },
    global: { headers: token ? { Authorization: `Bearer ${token}` } : {} },
  })
}
