// Uses Web Crypto API — works in Edge Runtime (middleware) and Node.js (API routes)

const TOKEN_TTL = 8 * 60 * 60 * 1000 // 8 hours
export const ADMIN_COOKIE = 'opus_info_admin'

function getSecret(): string {
  return process.env.ADMIN_JWT_SECRET ?? 'dev-secret-change-in-production'
}

async function importKey(): Promise<CryptoKey> {
  return crypto.subtle.importKey(
    'raw',
    new TextEncoder().encode(getSecret()),
    { name: 'HMAC', hash: 'SHA-256' },
    false,
    ['sign', 'verify']
  )
}

function toHex(buf: ArrayBuffer): string {
  return Array.from(new Uint8Array(buf))
    .map((b) => b.toString(16).padStart(2, '0'))
    .join('')
}

function fromHex(hex: string): Uint8Array {
  const arr = new Uint8Array(hex.length / 2)
  for (let i = 0; i < arr.length; i++) {
    arr[i] = parseInt(hex.slice(i * 2, i * 2 + 2), 16)
  }
  return arr
}

export async function signAdminToken(): Promise<string> {
  const exp = Date.now() + TOKEN_TTL
  const payload = String(exp)
  const key = await importKey()
  const sig = await crypto.subtle.sign('HMAC', key, new TextEncoder().encode(payload))
  return `${payload}.${toHex(sig)}`
}

export async function verifyAdminToken(token: string | undefined): Promise<boolean> {
  if (!token) return false
  const dot = token.lastIndexOf('.')
  if (dot === -1) return false
  const payload = token.slice(0, dot)
  const sigHex = token.slice(dot + 1)
  const exp = parseInt(payload, 10)
  if (isNaN(exp) || Date.now() > exp) return false
  try {
    const key = await importKey()
    return await crypto.subtle.verify(
      'HMAC',
      key,
      fromHex(sigHex),
      new TextEncoder().encode(payload)
    )
  } catch {
    return false
  }
}
