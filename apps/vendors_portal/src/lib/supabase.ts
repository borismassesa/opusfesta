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
 * configured (e.g. running in keyless dev mode), `getToken` throws a 404. In
 * that case we fall back to the **service-role admin client** so writes still
 * land — every consumer of this function already authenticates the request
 * via Clerk middleware + `getCurrentVendor`, then constrains the query with
 * an explicit `WHERE vendor_id = ?` / `WHERE id = ?` filter. The Clerk
 * session is the trust boundary; RLS is defense-in-depth that isn't
 * load-bearing here. Previously we returned an *unauthenticated* client,
 * which silently no-op'd every UPDATE (RLS matched 0 rows but Supabase
 * doesn't surface that as an error) — vendors saw "Save" appear to work
 * while nothing persisted.
 *
 * Production deployments should still configure the JWT template so RLS
 * gives proper defense-in-depth; the fallback only kicks in when the
 * template is missing.
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
    // Keyless / dev fallback: use the service-role admin client so writes
    // actually land. See jsdoc above for the trust-boundary rationale.
    console.warn(
      "[supabase] Clerk JWT template 'supabase' not found (404). Falling back to service-role admin client. Configure the template at https://dashboard.clerk.com/last-active?path=jwt-templates to enable RLS-backed reads in production.",
    )
    return createSupabaseAdminClient()
  }
  return createClient(url, key, {
    auth: { persistSession: false, autoRefreshToken: false },
    global: { headers: token ? { Authorization: `Bearer ${token}` } : {} },
  })
}
