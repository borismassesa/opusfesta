import 'server-only'
import { createHash, createHmac, randomBytes, timingSafeEqual } from 'node:crypto'
import QRCode from 'qrcode'

/**
 * Door-staff scanner access tokens + guest entry-pass signing.
 *
 * DUPLICATED from apps/opus_pass/src/lib/checkin/tokens.ts + qr.ts on
 * purpose for now (no shared package wired up yet — see the same note in
 * apps/opus_scanner/src/lib/checkin.ts and
 * apps/opus_pass/docs/checkin-scanner-plan.md). Entry-pass signing was
 * originally opus_pass-only (issued when a guest RSVPs "attending"
 * themselves), but the admin bulk-import flow needs to mint the same
 * tokens for guests it imports directly — CHECKIN_TOKEN_SECRET must match
 * across opus_pass/opus_scanner/opus_admin for a token minted here to
 * verify at the door.
 */
export interface GeneratedScannerAccessToken {
  /** Shown once to the admin, handed to the attendant — never persisted. */
  rawToken: string
  tokenHash: string
}

export function generateScannerAccessToken(): GeneratedScannerAccessToken {
  const rawToken = randomBytes(24).toString('base64url')
  return { rawToken, tokenHash: hashScannerAccessToken(rawToken) }
}

export function hashScannerAccessToken(rawToken: string): string {
  return createHash('sha256').update(rawToken).digest('hex')
}

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

export function signEntryPassToken(payload: EntryPassPayload): string {
  const body = b64urlEncode(JSON.stringify(payload))
  const sig = createHmac('sha256', getCheckinSecret()).update(body).digest('base64url')
  return `${body}.${sig}`
}

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

/** Same rendering options as apps/opus_pass/src/lib/checkin/qr.ts so a
 * ticket looks identical regardless of which app generated it. */
export async function generateEntryPassQrDataUrl(guestContactId: string, invitationId: string): Promise<string> {
  const token = signEntryPassToken({ invitationId, guestContactId })
  return QRCode.toDataURL(token, { margin: 1, width: 320, errorCorrectionLevel: 'M' })
}
