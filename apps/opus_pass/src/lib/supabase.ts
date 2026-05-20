import 'server-only'
import { createClient, type SupabaseClient } from '@supabase/supabase-js'

/**
 * Read-only Supabase client for opus_pass.
 * Uses service role for trusted server-side reads (marketing page content is public).
 * Never import this from a Client Component.
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
