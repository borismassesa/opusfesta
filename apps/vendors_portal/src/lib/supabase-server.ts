import { createClient, type SupabaseClient } from '@supabase/supabase-js'

/**
 * Read-only Supabase client for marketing/CMS reads from public schemas.
 * Used by apps/vendors_portal/src/lib/cms/* on the public landing page.
 *
 * Lives in its own module (no Clerk import) so transitive client-bundle
 * imports — e.g. a 'use client' component importing a runtime const from a
 * CMS module — don't pull in '@clerk/nextjs/server', which is server-only.
 */
export function createSupabaseServerClient(): SupabaseClient {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY
  if (!url || !key) {
    throw new Error('Missing NEXT_PUBLIC_SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY')
  }
  return createClient(url, key, {
    auth: { autoRefreshToken: false, persistSession: false },
  })
}
