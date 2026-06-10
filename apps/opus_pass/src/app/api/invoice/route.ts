import { NextResponse, type NextRequest } from 'next/server'
import { renderToBuffer, type DocumentProps } from '@react-pdf/renderer'
import { createElement, type ReactElement } from 'react'
import { InvoicePdf } from '@/lib/invoice-pdf'
import type { StoredOrder, StoredOrderItem } from '@/lib/cart-storage'

export const runtime = 'nodejs'

const MAX_BODY_BYTES = 64 * 1024
const MAX_ITEMS = 50
const MAX_ADDONS = 20

const str = (v: unknown, max: number): string =>
  typeof v === 'string' ? v.slice(0, max) : ''
const num = (v: unknown): number => (typeof v === 'number' && Number.isFinite(v) ? v : 0)

/**
 * The order lives in the customer's browser (localStorage), so the request body
 * is untrusted input rendered into a PDF returned only to the sender. Validation
 * here is about type/size hygiene, not authorization.
 */
function parseOrder(raw: unknown): StoredOrder | null {
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

  return {
    ref,
    paidAt: str(o.paidAt, 40),
    eventDate: str(o.eventDate, 40) || undefined,
    paymentLabel: str(o.paymentLabel, 120) || undefined,
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
async function readPayload(req: NextRequest): Promise<unknown> {
  const contentType = req.headers.get('content-type') ?? ''
  if (contentType.includes('application/x-www-form-urlencoded') || contentType.includes('multipart/form-data')) {
    const form = await req.formData()
    const raw = form.get('order')
    return typeof raw === 'string' ? JSON.parse(raw) : null
  }
  return req.json()
}

export async function POST(req: NextRequest) {
  const length = Number(req.headers.get('content-length') ?? 0)
  if (length > MAX_BODY_BYTES) {
    return NextResponse.json({ error: 'Payload too large' }, { status: 413 })
  }

  let order: StoredOrder | null
  try {
    order = parseOrder(await readPayload(req))
  } catch {
    order = null
  }
  if (!order) {
    return NextResponse.json({ error: 'Invalid order payload' }, { status: 400 })
  }

  try {
    const pdf = await renderToBuffer(
      createElement(InvoicePdf, { order }) as ReactElement<DocumentProps>,
    )
    const safeRef = order.ref.replace(/[^A-Za-z0-9_-]/g, '') || 'order'
    return new NextResponse(new Uint8Array(pdf), {
      headers: {
        'Content-Type': 'application/pdf',
        'Content-Disposition': `attachment; filename="OpusFesta-Invoice-${safeRef}.pdf"`,
        'Cache-Control': 'no-store',
      },
    })
  } catch (err) {
    console.error('[api/invoice] PDF render failed', err)
    return NextResponse.json({ error: 'Could not generate the invoice' }, { status: 500 })
  }
}
