import { NextResponse } from 'next/server'
import { createScannerClient } from '@/lib/supabase'
import { hashScannerAccessToken } from '@/lib/checkin'

/**
 * Resolves a bare code (typed manually on the home screen, no link) to its
 * eventId. token_hash is globally unique, so this needs no other filter —
 * the couple/admin only ever hands out the code alongside an event, but the
 * device doesn't know which event until it asks. Full validation (expiry,
 * revocation, roster) still happens in /api/access/validate right after the
 * client redirects to /event/[eventId]?token=..., this route only routes.
 */
export async function POST(request: Request) {
  const { token } = (await request.json().catch(() => ({}))) as { token?: string }
  if (!token) return NextResponse.json({ ok: false, error: 'Missing code' }, { status: 400 })

  const supabase = createScannerClient()
  const { data: row, error } = await supabase
    .from('scanner_access_tokens')
    .select('event_id, revoked_at, expires_at')
    .eq('token_hash', hashScannerAccessToken(token.trim()))
    .maybeSingle()

  if (error) return NextResponse.json({ ok: false, error: 'Lookup failed' }, { status: 500 })
  if (!row) return NextResponse.json({ ok: false, error: 'That code was not recognized' }, { status: 401 })
  if (row.revoked_at) return NextResponse.json({ ok: false, error: 'This code has been revoked' }, { status: 401 })
  if (new Date(row.expires_at).getTime() < Date.now()) {
    return NextResponse.json({ ok: false, error: 'This code has expired' }, { status: 401 })
  }

  return NextResponse.json({ ok: true, eventId: row.event_id })
}
