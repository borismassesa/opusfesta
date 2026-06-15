import { NextResponse } from 'next/server'
import { randomUUID } from 'node:crypto'
import type { InitiateRequest, InitiateResponse } from '@/lib/payments/types'
import { priceOrder } from '@/lib/payments/pricing'
import { getDashboardUser } from '@/lib/dashboard/auth'
import { createNotification } from '@/lib/dashboard/notifications'
import {
  createPendingOrder,
  markManualPaymentEmails,
  setProviderOrderId,
  transitionOrder,
} from '@/lib/payments/orders'
import { sendManualPaymentSubmittedEmails } from '@/lib/payments/email'
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
const PAYREF_RE = /^[A-Za-z0-9.\-]{6,25}$/

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

function formatTzs(value: number): string {
  return `TZS ${value.toLocaleString('en-US')}`
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
  if (method !== 'mobile' && method !== 'card' && method !== 'lipa_namba') {
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
  if (method === 'lipa_namba') {
    const phone = body.phone?.trim()
    if (!phone || !PHONE_RE.test(phone)) return bad('Enter the phone number used to pay.')
    if (!body.payerName?.trim() || body.payerName.trim().length < 3) {
      return bad('Enter the name on the account used to pay.')
    }
    if (!body.paymentReference?.trim() || !PAYREF_RE.test(body.paymentReference.trim())) {
      return bad('Enter the payment reference from your confirmation SMS.')
    }
  }

  // ── Authoritative amount (never trust the client's totals) ──────────────────
  const pricing = await priceOrder(items)
  if (pricing.amountTotal <= 0) return bad('Order total is invalid.')
  if (pricing.adjustments.length > 0) {
    console.warn('[payments] client totals adjusted to CMS prices', pricing.adjustments)
  }

  const ref = generateRef()
  const origin = appOrigin(req)
  const dashboardUser = await getDashboardUser().catch((error) => {
    console.error('[payments] dashboard user lookup failed', error)
    return null
  })
  const payerPhone = method === 'mobile' || method === 'lipa_namba'
    ? normalizeMsisdn(body.phone!.trim())
    : null

  if (method === 'lipa_namba') {
    const payerName = body.payerName?.trim() ?? ''
    const paymentReference = body.paymentReference?.trim().toUpperCase() ?? ''
    const order = await createPendingOrder({
      ref,
      userId: dashboardUser?.id ?? null,
      currency: pricing.currency,
      subtotal: pricing.subtotal,
      discount: pricing.discount,
      amountTotal: pricing.amountTotal,
      contact: { name: contact.name, email: contact.email, phone: contact.phone },
      eventDate: body.eventDate ?? null,
      items: pricing.items,
      status: 'processing',
      provider: 'mpesa_lipa_namba',
      paymentMethod: 'lipa_namba',
      payerPhone,
      payerName,
      paymentReference,
      paymentSubmittedAt: new Date().toISOString(),
      paymentLabel: body.paymentLabel ?? null,
    })
    const emailFlags = await sendManualPaymentSubmittedEmails(order)
    await Promise.all([
      markManualPaymentEmails(ref, emailFlags),
      dashboardUser
        ? createNotification({
            userId: dashboardUser.id,
            type: 'system',
            title: 'Invitation payment submitted',
            body: `${formatTzs(pricing.amountTotal)} is under finance review${paymentReference ? ` · ref ${paymentReference}` : ''}`,
            href: '/my/dashboard/orders',
          })
        : Promise.resolve(),
    ])
    return NextResponse.json({
      ref,
      status: 'processing',
      message: 'Payment submitted for review.',
    })
  }

  // Fail loudly when the automated gateway isn't wired up. Manual Lipa Namba is
  // handled above because the customer already paid externally.
  if (!isSelcomConfigured()) {
    return NextResponse.json(
      { ref: '', status: 'failed', message: 'Payments are not available right now. Please try again later.' },
      { status: 503 },
    )
  }

  // ── Persist as pending BEFORE talking to Selcom ─────────────────────────────
  await createPendingOrder({
    ref,
    userId: dashboardUser?.id ?? null,
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
