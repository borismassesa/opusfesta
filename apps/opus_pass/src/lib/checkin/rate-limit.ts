import type { createSupabaseServerClient } from '@/lib/supabase'

type ServerClient = ReturnType<typeof createSupabaseServerClient>

/**
 * Postgres-backed fixed-window rate limit (migration 20260722000004).
 * Returns false when the caller should be rejected with a 429.
 *
 * Fails OPEN on infrastructure error: if the DB is down the actual check-in
 * lookups fail anyway, so failing closed here would add nothing except a
 * second way to jam a live wedding door. The error is logged so an outage
 * of just this RPC doesn't hide silently behind admitted guests.
 */
export async function withinRateLimit(
  supabase: ServerClient,
  key: string,
  max: number,
  windowSeconds: number,
): Promise<boolean> {
  const { data, error } = await supabase.rpc('checkin_rate_limit', {
    p_key: key,
    p_max: max,
    p_window_seconds: windowSeconds,
  })
  if (error) {
    console.error('[checkin] rate-limit check failed, allowing request', error)
    return true
  }
  return data !== false
}

/** First hop of x-forwarded-for — the client, on Vercel. Attendants share
 *  venue wifi, so per-IP limits must stay loose; tight limits are keyed on
 *  the verified door token instead. */
export function clientIp(request: Request): string {
  return request.headers.get('x-forwarded-for')?.split(',')[0]?.trim() || 'unknown'
}

export const RATE_LIMITED_RESPONSE = {
  status: 'error' as const,
  message: 'Too many attempts — wait a moment and try again',
}
