import type { NextRequest } from 'next/server'
import type { StoredOrder, StoredOrderItem, StoredOrderPayment } from '@/lib/cart-storage'

// Shared between /api/invoice (PDF download) and /api/invoice/email (receipt
// email). The order lives in the customer's browser (localStorage), so the
// request body is untrusted input. Validation here is about type/size hygiene,
// not authorization.

export const MAX_ORDER_BODY_BYTES = 64 * 1024
const MAX_ITEMS = 50
const MAX_ADDONS = 20

const str = (v: unknown, max: number): string =>
  typeof v === 'string' ? v.slice(0, max) : ''
const num = (v: unknown): number => (typeof v === 'number' && Number.isFinite(v) ? v : 0)

export function parseOrder(raw: unknown): StoredOrder | null {
  if (typeof raw !== 'object' || raw === null) return null
  const o = raw as Record<string, unknown>
  const contact = (typeof o.contact === 'object' && o.contact !== null ? o.contact : {}) as Record<string, unknown>
  const ref = str(o.ref, 40)
  if (!ref || !Array.isArray(o.items) || o.items.length === 0) return null

  const items: StoredOrderItem[] = o.items.slice(0, MAX_ITEMS).map((it) => {
    const i = (typeof it === 'object' && it !== null ? it : {}) as Record<string, unknown>
    return {
      id: str(i.id, 60),
      name: str(i.name, 200) || 'Item',
      summary: str(i.summary, 400),
      total: num(i.total),
      tier: str(i.tier, 60) || undefined,
      tierId: str(i.tierId, 60) || undefined,
      guests: typeof i.guests === 'number' && Number.isFinite(i.guests) ? i.guests : undefined,
      addOns: Array.isArray(i.addOns)
        ? i.addOns.slice(0, MAX_ADDONS).map((a) => str(a, 200)).filter(Boolean)
        : undefined,
    }
  })

  const pay = (typeof o.payment === 'object' && o.payment !== null ? o.payment : null) as
    | Record<string, unknown>
    | null
  const payment: StoredOrderPayment | undefined =
    pay && str(pay.provider, 60)
      ? {
          provider: str(pay.provider, 60),
          businessNumber: str(pay.businessNumber, 40) || undefined,
          payerPhone: str(pay.payerPhone, 60) || undefined,
          payerName: str(pay.payerName, 120) || undefined,
          cardLast4: str(pay.cardLast4, 8) || undefined,
          reference: str(pay.reference, 40) || undefined,
        }
      : undefined

  return {
    ref,
    paidAt: str(o.paidAt, 40),
    eventDate: str(o.eventDate, 40) || undefined,
    paymentLabel: str(o.paymentLabel, 120) || undefined,
    payment,
    paymentRef: str(o.paymentRef, 40) || undefined,
    paymentStatus: o.paymentStatus === 'verifying' || o.paymentStatus === 'paid' ? o.paymentStatus : undefined,
    contact: {
      name: str(contact.name, 120) || undefined,
      email: str(contact.email, 200),
      phone: str(contact.phone, 60),
    },
    items,
    subtotal: num(o.subtotal),
    discount: num(o.discount),
    total: num(o.total),
  }
}

/** Accepts JSON (fetch path) or a form field named `order` (no-JS download path). */
export async function readOrderPayload(req: NextRequest): Promise<unknown> {
  const contentType = req.headers.get('content-type') ?? ''
  if (contentType.includes('application/x-www-form-urlencoded') || contentType.includes('multipart/form-data')) {
    const form = await req.formData()
    const raw = form.get('order')
    if (typeof raw !== 'string' || raw.length > MAX_ORDER_BODY_BYTES) return null
    return JSON.parse(raw)
  }
  // Read as text first so the size cap holds even for chunked requests that
  // omit Content-Length (the Content-Length header check is advisory only).
  const text = await req.text()
  if (text.length > MAX_ORDER_BODY_BYTES) return null
  return JSON.parse(text)
}
