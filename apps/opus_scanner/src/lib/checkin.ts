import 'server-only'
import { createHash, createHmac, timingSafeEqual } from 'node:crypto'

/**
 * Token verification for the door scanner.
 *
 * DUPLICATED from apps/opus_pass/src/lib/checkin/tokens.ts on purpose for
 * now — both apps need the exact same HMAC scheme against the same
 * CHECKIN_TOKEN_SECRET, but there's no shared package wired up for it yet.
 * Follow-up: extract this pair into @opusfesta/lib so the two copies can't
 * drift (see apps/opus_pass/docs/checkin-scanner-plan.md).
 */

function getCheckinSecret(): string {
  const secret = process.env.CHECKIN_TOKEN_SECRET
  if (!secret) throw new Error('CHECKIN_TOKEN_SECRET is not configured')
  return secret
}

export interface EntryPassPayload {
  invitationId: string
  guestContactId: string
}

function b64urlEncode(input: string): string {
  return Buffer.from(input, 'utf8').toString('base64url')
}
function b64urlDecode(input: string): string {
  return Buffer.from(input, 'base64url').toString('utf8')
}

/**
 * Recompute a guest's entry-pass token server-side (deterministic — same
 * inputs always produce the same signed token). Used to build the offline
 * roster snapshot: the scanner device already sees each guest's raw token
 * one at a time during a normal scan, so shipping the full valid set ahead
 * of time for offline lookups isn't a new information leak.
 */
export function signEntryPassToken(payload: EntryPassPayload): string {
  const body = b64urlEncode(JSON.stringify(payload))
  const sig = createHmac('sha256', getCheckinSecret()).update(body).digest('base64url')
  return `${body}.${sig}`
}

/** Verify + decode a scanned QR token. Returns null on any tamper/format/signature failure. */
export function verifyEntryPassToken(token: string): EntryPassPayload | null {
  const parts = token.split('.')
  if (parts.length !== 2) return null
  const [body, sig] = parts
  const expected = createHmac('sha256', getCheckinSecret()).update(body).digest('base64url')

  const sigBuf = Buffer.from(sig)
  const expectedBuf = Buffer.from(expected)
  if (sigBuf.length !== expectedBuf.length || !timingSafeEqual(sigBuf, expectedBuf)) return null

  try {
    const parsed = JSON.parse(b64urlDecode(body))
    if (typeof parsed?.invitationId !== 'string' || typeof parsed?.guestContactId !== 'string') return null
    return parsed as EntryPassPayload
  } catch {
    return null
  }
}

/** Hash a door-staff bearer token the same way opus_pass hashed it at generation time. */
export function hashScannerAccessToken(rawToken: string): string {
  return createHash('sha256').update(rawToken).digest('hex')
}
