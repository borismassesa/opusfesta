import { NextResponse } from 'next/server'
import { createSupabaseServerClient } from '@/lib/supabase'
import { candidateScannerAccessHashes } from '@/lib/checkin/tokens'
import { clientIp, withinRateLimit } from '@/lib/checkin/rate-limit'

/**
 * Resolves a bare door-staff code (typed into the mobile scanner) to its
 * eventId. token_hash is globally unique so no other filter is needed — the
 * device doesn't know which event it's scanning for until it asks.
 *
 * This only routes. Full validation (expiry, revocation, roster) happens in
 * /api/checkin/validate immediately afterwards, and again on every scan, so
 * a stale answer here can't admit anyone.
 *
 * Mirrors apps/opus_scanner/src/app/api/access/resolve/route.ts. That app is
 * not currently deployed; these routes live in opus_pass because it already
 * owns CHECKIN_TOKEN_SECRET (lib/checkin/tokens.ts) and is the origin the
 * mobile app is configured to reach (EXPO_PUBLIC_OPUS_PASS_URL).
 */
export async function POST(request: Request) {
  const { token } = (await request.json().catch(() => ({}))) as { token?: string }
  if (!token) return NextResponse.json({ ok: false, error: 'Missing code' }, { status: 400 })

  const supabase = createSupabaseServerClient()

  // Door-code login is the brute-force surface. The budget is shared by the
  // whole venue NAT, so it's sized for the worst legitimate minute — every
  // attendant logging in at doors-open with a typo or two each. Typing an
  // 8-char code takes seconds, so 60/min can't be reached by honest use,
  // while against a 2^40 code space it's no gift to a brute-forcer.
  if (!(await withinRateLimit(supabase, `resolve:${clientIp(request)}`, 60, 60))) {
    return NextResponse.json(
      { ok: false, error: 'Too many attempts — wait a moment and try again' },
      { status: 429 }
    )
  }
  const { data: row, error } = await supabase
    .from('scanner_access_tokens')
    .select('event_id, revoked_at, expires_at')
    .in('token_hash', candidateScannerAccessHashes(token))
    .maybeSingle()

  if (error) return NextResponse.json({ ok: false, error: 'Lookup failed' }, { status: 500 })
  if (!row) return NextResponse.json({ ok: false, error: 'That code was not recognized' }, { status: 401 })
  if (row.revoked_at) return NextResponse.json({ ok: false, error: 'This code has been revoked' }, { status: 401 })
  if (new Date(row.expires_at).getTime() < Date.now()) {
    return NextResponse.json({ ok: false, error: 'This code has expired' }, { status: 401 })
  }

  return NextResponse.json({ ok: true, eventId: row.event_id })
}
