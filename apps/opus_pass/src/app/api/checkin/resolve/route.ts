import { NextResponse } from 'next/server'
import { createSupabaseServerClient } from '@/lib/supabase'
import { candidateScannerAccessHashes } from '@/lib/checkin/tokens'

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
