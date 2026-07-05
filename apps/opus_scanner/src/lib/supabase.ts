import 'server-only'
import { createClient, type SupabaseClient } from '@supabase/supabase-js'

/**
 * Service-role Supabase client for the door scanner API routes.
 *
 * Door staff never get a Clerk session — every request is authorized by a
 * scanner_access_tokens bearer token verified in-route (see lib/checkin.ts),
 * so this client always talks to the DB with elevated privileges. Never
 * import from a Client Component.
 */
export function createScannerClient(): SupabaseClient {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY
  if (!url || !key) {
    throw new Error('Missing NEXT_PUBLIC_SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY')
  }
  return createClient(url, key, {
    auth: { autoRefreshToken: false, persistSession: false },
  })
}
