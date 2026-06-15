import { NextResponse } from 'next/server'
import { randomUUID } from 'node:crypto'
import type { InitiateRequest, InitiateResponse } from '@/lib/payments/types'
import { priceOrder } from '@/lib/payments/pricing'
import { createPendingOrder, setProviderOrderId, transitionOrder } from '@/lib/payments/orders'
import {
  isSelcomConfigured,
  createOrder,
  walletPush,
  extractGatewayUrl,
  normalizeMsisdn,
} from '@/lib/payments/selcom'

// Payment calls must never be cached or statically optimised.
export const dynamic = 'force-dynamic'
export const runtime = 'nodejs'

const PHONE_RE = /^\+?(?:[\d](?:[\s().-]?)){9,}$/

function generateRef(): string {
  const year = new Date().getFullYear()
  const token = randomUUID().replace(/-/g, '').slice(0, 6).toUpperCase()
  return `OF-${year}-${token}`
}

function appOrigin(req: Request): string {
  // Prefer the configured public URL (the webhook must be publicly reachable);
  // fall back to the request origin for local dev.
  return (process.env.NEXT_PUBLIC_OPUS_PASS_URL ?? new URL(req.url).origin).replace(/\/$/, '')
}

export async function POST(req: Request): Promise<NextResponse<InitiateResponse>> {
  let body: InitiateRequest
  try {
    body = (await req.json()) as InitiateRequest
  } catch {
    return NextResponse.json(
      { ref: '', status: 'failed', message: 'Invalid request.' },
      { status: 400 },
    )
  }

  // ── Validate ──────────────────────────────────────────────────────────────
  const { method, contact, items } = body
  if (method !== 'mobile' && method !== 'card') {
    return bad('Choose a payment method.')
  }
  if (!Array.isArray(items) || items.length === 0) {
    return bad('Your cart is empty.')
  }
  if (!contact?.email || !contact?.phone) {
    return bad('Contact email and phone are required.')
  }
  if (method === 'mobile') {
    const phone = body.phone?.trim()
    if (!phone || !PHONE_RE.test(phone)) return bad('Enter a valid M-Pesa phone number.')
  }

  // Fail loudly when the gateway isn't wired up — better an honest error than a
  // fake "paid" screen (the bug this whole feature fixes).
  if (!isSelcomConfigured()) {
    return NextResponse.json(
      { ref: '', status: 'failed', message: 'Payments are not available right now. Please try again later.' },
      { status: 503 },
    )
  }

  // ── Authoritative amount (never trust the client's totals) ──────────────────
  const pricing = await priceOrder(items)
  if (pricing.amountTotal <= 0) return bad('Order total is invalid.')
  if (pricing.adjustments.length > 0) {
    console.warn('[payments] client totals adjusted to CMS prices', pricing.adjustments)
  }

  const ref = generateRef()
  const origin = appOrigin(req)
  const payerPhone = method === 'mobile' ? normalizeMsisdn(body.phone!.trim()) : null

  // ── Persist as pending BEFORE talking to Selcom ─────────────────────────────
  await createPendingOrder({
    ref,
    currency: pricing.currency,
    subtotal: pricing.subtotal,
    discount: pricing.discount,
    amountTotal: pricing.amountTotal,
    contact: { name: contact.name, email: contact.email, phone: contact.phone },
    eventDate: body.eventDate ?? null,
    items: pricing.items,
    paymentMethod: method,
    payerPhone,
    paymentLabel: body.paymentLabel ?? null,
  })

  // ── Create the Selcom order ─────────────────────────────────────────────────
  try {
    const created = await createOrder({
      orderRef: ref,
      amount: pricing.amountTotal,
      currency: pricing.currency,
      buyerName: contact.name ?? 'OpusPass customer',
      buyerEmail: contact.email,
      buyerPhone: contact.phone,
      redirectUrl: `${origin}/invitations/confirmation?ref=${ref}`,
      cancelUrl: `${origin}/invitations/checkout`,
      webhookUrl: `${origin}/api/payments/webhook`,
    })

    if (created.resultcode && created.resultcode !== '000') {
      await transitionOrder(ref, 'failed')
      return NextResponse.json(
        { ref, status: 'failed', message: created.message ?? 'Could not start the payment.' },
        { status: 502 },
      )
    }

    if (method === 'card') {
      const redirectUrl = extractGatewayUrl(created)
      if (!redirectUrl) {
        await transitionOrder(ref, 'failed')
        return NextResponse.json(
          { ref, status: 'failed', message: 'Card payment is unavailable right now.' },
          { status: 502 },
        )
      }
      return NextResponse.json({ ref, status: 'pending', redirectUrl })
    }

    // Mobile — fire the USSD push so the PIN prompt appears on the phone.
    const transid = randomUUID().replace(/-/g, '').slice(0, 20)
    await setProviderOrderId(ref, transid)
    const push = await walletPush({ orderRef: ref, msisdn: payerPhone!, transid })
    if (push.resultcode && push.resultcode !== '000') {
      await transitionOrder(ref, 'failed')
      return NextResponse.json(
        { ref, status: 'failed', message: push.message ?? 'Could not send the payment prompt.' },
        { status: 502 },
      )
    }
    return NextResponse.json({ ref, status: 'pending' })
  } catch (err) {
    console.error('[payments] initiate failed', err)
    await transitionOrder(ref, 'failed').catch(() => {})
    return NextResponse.json(
      { ref, status: 'failed', message: 'Payment could not be started. Please try again.' },
      { status: 502 },
    )
  }
}

function bad(message: string): NextResponse<InitiateResponse> {
  return NextResponse.json({ ref: '', status: 'failed', message }, { status: 400 })
}
