import { createHmac, timingSafeEqual } from 'node:crypto'

type InquiryTokenPayload = {
  inquiryId: string
  email: string
  iat: number
  exp: number
}

export type VerifiedInquiryToken = InquiryTokenPayload

const DEFAULT_TTL_SECONDS = 60 * 60 * 24 * 14

function getSecret(): string {
  const secret = process.env.INQUIRY_TOKEN_SECRET || process.env.JWT_SECRET

  if (secret?.trim()) {
    return secret
  }

  if (process.env.NODE_ENV !== 'production') {
    return 'opusfesta-dev-inquiry-token-secret'
  }

  throw new Error('Missing inquiry token secret. Set INQUIRY_TOKEN_SECRET or JWT_SECRET.')
}

function signPayload(payloadB64: string, secret: string): string {
  return createHmac('sha256', secret).update(payloadB64).digest('base64url')
}

function toBase64UrlJson(payload: InquiryTokenPayload): string {
  return Buffer.from(JSON.stringify(payload), 'utf8').toString('base64url')
}

function fromBase64UrlJson(value: string): InquiryTokenPayload | null {
  try {
    const decoded = Buffer.from(value, 'base64url').toString('utf8')
    const parsed = JSON.parse(decoded) as Partial<InquiryTokenPayload>

    if (
      typeof parsed.inquiryId !== 'string'
      || typeof parsed.email !== 'string'
      || typeof parsed.iat !== 'number'
      || typeof parsed.exp !== 'number'
    ) {
      return null
    }

    return {
      inquiryId: parsed.inquiryId,
      email: parsed.email,
      iat: parsed.iat,
      exp: parsed.exp,
    }
  } catch {
    return null
  }
}

function isValidSignature(payloadB64: string, signature: string, secret: string): boolean {
  const expected = signPayload(payloadB64, secret)
  const expectedBuffer = Buffer.from(expected)
  const signatureBuffer = Buffer.from(signature)

  if (expectedBuffer.length !== signatureBuffer.length) {
    return false
  }

  return timingSafeEqual(expectedBuffer, signatureBuffer)
}

export function generateInquiryToken(
  inquiryId: string,
  email: string,
  ttlSeconds: number = DEFAULT_TTL_SECONDS,
): string {
  const now = Math.floor(Date.now() / 1000)
  const payload: InquiryTokenPayload = {
    inquiryId,
    email: email.trim().toLowerCase(),
    iat: now,
    exp: now + Math.max(60, Math.floor(ttlSeconds)),
  }

  const payloadB64 = toBase64UrlJson(payload)
  const signature = signPayload(payloadB64, getSecret())
  return `${payloadB64}.${signature}`
}

export function verifyInquiryToken(token: string): VerifiedInquiryToken | null {
  if (!token || typeof token !== 'string') {
    return null
  }

  const [payloadB64, signature] = token.split('.')
  if (!payloadB64 || !signature) {
    return null
  }

  const secret = getSecret()
  if (!isValidSignature(payloadB64, signature, secret)) {
    return null
  }

  const payload = fromBase64UrlJson(payloadB64)
  if (!payload) {
    return null
  }

  const now = Math.floor(Date.now() / 1000)
  if (payload.exp <= now) {
    return null
  }

  return payload
}
