import 'server-only'
import { createHash, createHmac, randomBytes, timingSafeEqual } from 'node:crypto'

/**
 * Signed tokens for the door-staff check-in scanner (apps/opus_scanner).
 *
 * Two distinct token types share the same HMAC pattern used elsewhere in
 * opus_pass (see lib/payments/selcom.ts):
 *  - Guest entry-pass token: encodes which guest_invitation a QR code admits,
 *    verified server-side on every scan — never trust the client's decode.
 *  - Scanner access token: a random bearer credential handed to a door-staff
 *    device. Only its SHA-256 hash is ever stored (scanner_access_tokens.token_hash);
 *    the raw value is shown once at generation time.
 */

function getCheckinSecret(): string {
  const secret = process.env.CHECKIN_TOKEN_SECRET
  if (!secret) throw new Error('CHECKIN_TOKEN_SECRET is not configured')
  return secret
}

export interface EntryPassPayload {
  /** guest_invitations.id — the specific (guest, event) admission this QR covers. */
  invitationId: string
  /** guest_contacts.id — included so the scanner can show the guest's name without a lookup miss. */
  guestContactId: string
}

/** Base64url encode/decode without padding, safe for embedding in a QR string. */
function b64urlEncode(input: string): string {
  return Buffer.from(input, 'utf8').toString('base64url')
}
function b64urlDecode(input: string): string {
  return Buffer.from(input, 'base64url').toString('utf8')
}

/** Sign a guest entry-pass payload into an opaque, verifiable QR token. */
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

export interface GeneratedScannerAccessToken {
  /** Shown once to the couple/admin, handed to door staff — never persisted. */
  rawToken: string
  /** What actually gets stored in scanner_access_tokens.token_hash. */
  tokenHash: string
}

/** Mint a new door-staff device credential. */
export function generateScannerAccessToken(): GeneratedScannerAccessToken {
  const rawToken = randomBytes(24).toString('base64url')
  return { rawToken, tokenHash: hashScannerAccessToken(rawToken) }
}

/** Hash a bearer token the same way at generation time and at verification time. */
export function hashScannerAccessToken(rawToken: string): string {
  return createHash('sha256').update(rawToken).digest('hex')
}
