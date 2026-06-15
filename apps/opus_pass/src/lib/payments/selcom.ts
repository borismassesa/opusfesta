import 'server-only'
import { createHmac } from 'node:crypto'

// ─────────────────────────────────────────────────────────────────────────────
//  Selcom Checkout API adapter (Tanzania).
//
//  The ONLY provider-specific code. Everything else (orders, routes, UI) is
//  provider-agnostic, so swapping to another gateway later means rewriting just
//  this file.
//
//  Selcom authenticates every request with a signed-header scheme:
//    Authorization : "SELCOM " + base64(API_KEY)
//    Digest-Method : HS256
//    Digest        : base64( HMAC-SHA256( signData, API_SECRET ) )
//    Signed-Fields : comma-separated list of the body fields that were signed
//    Timestamp     : ISO-8601 with timezone
//  where signData = "timestamp=<ts>" + "&<field>=<value>" for each signed field,
//  in the exact Signed-Fields order.
//
//  ⚠️  The signed-field ORDER and the exact field set are account/version
//  specific and unforgiving. Validate `computeSignature` against your Selcom
//  sandbox response before go-live — a 400 "invalid signature" means the order
//  or field list here doesn't match what your account expects.
// ─────────────────────────────────────────────────────────────────────────────

type SelcomConfig = {
  baseUrl: string
  apiKey: string
  apiSecret: string
  vendorId: string
}

function getConfig(): SelcomConfig {
  const baseUrl = process.env.SELCOM_BASE_URL
  const apiKey = process.env.SELCOM_API_KEY
  const apiSecret = process.env.SELCOM_API_SECRET
  const vendorId = process.env.SELCOM_VENDOR_ID
  if (!baseUrl || !apiKey || !apiSecret || !vendorId) {
    throw new Error(
      'Selcom is not configured — set SELCOM_BASE_URL, SELCOM_API_KEY, SELCOM_API_SECRET, SELCOM_VENDOR_ID',
    )
  }
  // Normalise: no trailing slash so we can join paths predictably.
  return { baseUrl: baseUrl.replace(/\/$/, ''), apiKey, apiSecret, vendorId }
}

/** True when the gateway has credentials — lets callers fail fast with a clear error. */
export function isSelcomConfigured(): boolean {
  return Boolean(
    process.env.SELCOM_BASE_URL &&
      process.env.SELCOM_API_KEY &&
      process.env.SELCOM_API_SECRET &&
      process.env.SELCOM_VENDOR_ID,
  )
}

// Selcom expects this timestamp format (ISO-8601 with offset, no millis).
function selcomTimestamp(): string {
  // e.g. 2026-06-13T12:34:56+00:00 — the server runs UTC on Vercel.
  return new Date().toISOString().replace(/\.\d{3}Z$/, '+00:00')
}

/**
 * Build the Selcom auth headers for a request body. `signedFields` lists the
 * body keys to sign, in the order Selcom expects for this endpoint.
 */
function signedHeaders(
  cfg: SelcomConfig,
  body: Record<string, string | number>,
  signedFields: string[],
): Record<string, string> {
  const timestamp = selcomTimestamp()
  let signData = `timestamp=${timestamp}`
  for (const field of signedFields) {
    signData += `&${field}=${body[field] ?? ''}`
  }
  const digest = createHmac('sha256', cfg.apiSecret).update(signData).digest('base64')
  return {
    'Content-Type': 'application/json',
    Authorization: `SELCOM ${Buffer.from(cfg.apiKey).toString('base64')}`,
    'Digest-Method': 'HS256',
    Digest: digest,
    'Signed-Fields': signedFields.join(','),
    Timestamp: timestamp,
  }
}

async function selcomPost<T = SelcomResponse>(
  path: string,
  body: Record<string, string | number>,
  signedFields: string[],
): Promise<T> {
  const cfg = getConfig()
  const res = await fetch(`${cfg.baseUrl}${path}`, {
    method: 'POST',
    headers: signedHeaders(cfg, body, signedFields),
    body: JSON.stringify(body),
    // Never cache a payment call.
    cache: 'no-store',
  })
  const json = (await res.json().catch(() => ({}))) as T
  return json
}

// ── Response shapes (Selcom wraps results in result/resultcode + data[]) ──────

export type SelcomResponse = {
  reference?: string
  resultcode?: string // "000" = success
  result?: string // "SUCCESS" | "FAIL"
  message?: string
  data?: Array<Record<string, string>>
}

/**
 * Create the Selcom order. For both methods this reserves the charge; for the
 * card method the response carries a base64 `payment_gateway_url` to redirect to.
 */
export async function createOrder(params: {
  orderRef: string
  amount: number
  currency: string
  buyerName: string
  buyerEmail: string
  buyerPhone: string
  /** Where Selcom returns the buyer after a card payment. */
  redirectUrl: string
  cancelUrl: string
  /** Our webhook that Selcom calls server-to-server (base64-encoded per spec). */
  webhookUrl: string
}): Promise<SelcomResponse> {
  const cfg = getConfig()
  const body: Record<string, string | number> = {
    vendor: cfg.vendorId,
    order_id: params.orderRef,
    buyer_email: params.buyerEmail,
    buyer_name: params.buyerName,
    buyer_phone: normalizeMsisdn(params.buyerPhone),
    amount: Math.round(params.amount),
    currency: params.currency,
    redirect_url: Buffer.from(params.redirectUrl).toString('base64'),
    cancel_url: Buffer.from(params.cancelUrl).toString('base64'),
    webhook: Buffer.from(params.webhookUrl).toString('base64'),
    no_of_items: 1,
  }
  // Selcom signs the core order fields. Order matters — see ⚠️ above.
  const signedFields = ['vendor', 'order_id', 'buyer_email', 'buyer_name', 'buyer_phone', 'amount', 'currency']
  return selcomPost('/checkout/create-order-minimal', body, signedFields)
}

/**
 * Trigger the mobile-money USSD/STK push — this is what makes the PIN prompt
 * pop on the customer's phone. Call AFTER createOrder for the mobile method.
 */
export async function walletPush(params: {
  orderRef: string
  msisdn: string
  transid: string
}): Promise<SelcomResponse> {
  const body: Record<string, string | number> = {
    transid: params.transid,
    order_id: params.orderRef,
    msisdn: normalizeMsisdn(params.msisdn),
  }
  const signedFields = ['transid', 'order_id', 'msisdn']
  return selcomPost('/checkout/wallet-payment', body, signedFields)
}

/**
 * Query the authoritative payment status from Selcom. We call this from the
 * webhook (rather than trusting the callback body alone) and as a fallback when
 * polling, so the DB only ever flips to `paid` on a confirmed server-side read.
 */
export async function queryOrderStatus(orderRef: string): Promise<SelcomResponse> {
  const cfg = getConfig()
  const body: Record<string, string | number> = {
    order_id: orderRef,
    vendor: cfg.vendorId,
  }
  const signedFields = ['order_id', 'vendor']
  return selcomPost('/checkout/order-status', body, signedFields)
}

/** Map Selcom's payment_status string onto our order lifecycle. */
export function mapSelcomStatus(raw: string | undefined): 'paid' | 'failed' | 'pending' {
  const s = (raw ?? '').toUpperCase()
  if (s === 'COMPLETED' || s === 'SUCCESS' || s === 'PAID') return 'paid'
  if (s === 'FAILED' || s === 'CANCELLED' || s === 'REJECTED' || s === 'USERCANCELLED') return 'failed'
  return 'pending'
}

/** Pull the card hosted-checkout URL out of a create-order response (base64). */
export function extractGatewayUrl(res: SelcomResponse): string | undefined {
  const raw = res.data?.[0]?.payment_gateway_url
  if (!raw) return undefined
  try {
    // Selcom returns this base64-encoded.
    return Buffer.from(raw, 'base64').toString('utf8')
  } catch {
    return raw
  }
}

/** Normalise a phone number to Selcom's 255XXXXXXXXX msisdn form. */
export function normalizeMsisdn(phone: string): string {
  const digits = phone.replace(/\D/g, '')
  if (digits.startsWith('255')) return digits
  if (digits.startsWith('0')) return `255${digits.slice(1)}`
  if (digits.length === 9) return `255${digits}` // bare 7XXXXXXXX
  return digits
}
