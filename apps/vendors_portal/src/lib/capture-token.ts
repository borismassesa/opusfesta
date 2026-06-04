import { createHmac, timingSafeEqual } from 'node:crypto'

// Stateless, signed token that authorizes a phone (which is NOT signed in) to
// upload National ID photos for ONE vendor, for a short window. Encodes
// { vendorId, exp } and HMAC-signs it — no DB row needed. The mobile capture
// page and its upload action are the only things that trust this token, and
// its only power is "attach national_id_front/back images to this vendor".
//
// Secret: a dedicated CAPTURE_TOKEN_SECRET if set, else the service-role key
// (always present server-side) so the feature works without extra config.
// Set CAPTURE_TOKEN_SECRET in production to rotate independently.

const TTL_MS = 15 * 60 * 1000 // 15 minutes — long enough to grab a phone

function secret(): string {
  const s =
    process.env.CAPTURE_TOKEN_SECRET?.trim() ||
    process.env.SUPABASE_SERVICE_ROLE_KEY?.trim()
  if (!s) {
    throw new Error(
      '[capture-token] no signing secret — set CAPTURE_TOKEN_SECRET or SUPABASE_SERVICE_ROLE_KEY',
    )
  }
  return s
}

function b64url(input: Buffer | string): string {
  return Buffer.from(input)
    .toString('base64')
    .replace(/\+/g, '-')
    .replace(/\//g, '_')
    .replace(/=+$/, '')
}

function sign(payload: string): string {
  return b64url(createHmac('sha256', secret()).update(payload).digest())
}

export type CaptureClaims = { vendorId: string; exp: number }

/** Mint a token authorizing National ID uploads for `vendorId`. */
export function createCaptureToken(vendorId: string): string {
  const claims: CaptureClaims = { vendorId, exp: Date.now() + TTL_MS }
  const payload = b64url(JSON.stringify(claims))
  return `${payload}.${sign(payload)}`
}

/** Verify a token; returns the vendorId if valid + unexpired, else null. */
export function verifyCaptureToken(token: string | undefined | null): string | null {
  if (!token || typeof token !== 'string' || !token.includes('.')) return null
  const [payload, mac] = token.split('.')
  if (!payload || !mac) return null

  const expected = sign(payload)
  // Constant-time compare; bail if lengths differ (timingSafeEqual throws).
  if (expected.length !== mac.length) return null
  if (!timingSafeEqual(Buffer.from(expected), Buffer.from(mac))) return null

  try {
    const claims = JSON.parse(
      Buffer.from(payload.replace(/-/g, '+').replace(/_/g, '/'), 'base64').toString(),
    ) as CaptureClaims
    if (!claims.vendorId || typeof claims.exp !== 'number') return null
    if (Date.now() > claims.exp) return null
    return claims.vendorId
  } catch {
    return null
  }
}
