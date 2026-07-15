import 'server-only'
import { createClient, type SupabaseClient } from '@supabase/supabase-js'

// A network blip between this server and Supabase (ECONNRESET, a stalled TLS
// handshake, etc.) leaves a plain `fetch` hanging indefinitely rather than
// rejecting — every caller of this client already catches request failures
// and falls back to sane defaults (English copy, empty lists...), but only
// once the fetch actually rejects. Without a timeout, one bad connection can
// hold an entire page render open for minutes instead of failing fast into
// that fallback. 8s is generous for a normal Supabase/PostgREST round trip
// (usually well under 1s) while still bounding the worst case.
const REQUEST_TIMEOUT_MS = 8000

function timeoutFetch(input: RequestInfo | URL, init: RequestInit = {}): Promise<Response> {
  const timeoutSignal = AbortSignal.timeout(REQUEST_TIMEOUT_MS)
  const signal = init.signal ? AbortSignal.any([init.signal, timeoutSignal]) : timeoutSignal
  return fetch(input, { ...init, signal })
}

/**
 * Trusted server-side Supabase client for opus_pass (service role).
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
    global: { fetch: timeoutFetch },
  })
}
