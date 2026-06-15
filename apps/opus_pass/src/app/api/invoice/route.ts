import { NextResponse, type NextRequest } from 'next/server'
import { renderToBuffer, type DocumentProps } from '@react-pdf/renderer'
import { createElement, type ReactElement } from 'react'
import { InvoicePdf } from '@/lib/invoice-pdf'
import { MAX_ORDER_BODY_BYTES, parseOrder, readOrderPayload } from '@/lib/order-payload'
import { getOrderByRef, orderRowToStoredOrder } from '@/lib/payments/orders'
import type { StoredOrder } from '@/lib/cart-storage'

export const runtime = 'nodejs'

async function pdfResponse(order: StoredOrder): Promise<NextResponse> {
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

export async function POST(req: NextRequest) {
  const length = Number(req.headers.get('content-length') ?? 0)
  if (length > MAX_ORDER_BODY_BYTES) {
    return NextResponse.json({ error: 'Payload too large' }, { status: 413 })
  }

  // Server-to-server (admin) mode: an authenticated caller passes { ref } and we
  // render the persisted order's invoice. Gated by the shared secret so invoices
  // can't be enumerated by ref. The open mode below renders a posted order for
  // the customer's own download (no DB read, no data exposure).
  const auth = req.headers.get('authorization')
  const secret = process.env.OPUS_PASS_REVALIDATE_SECRET
  if (secret && auth === `Bearer ${secret}`) {
    let ref: unknown = null
    try {
      ref = (await req.json())?.ref
    } catch {
      ref = null
    }
    if (typeof ref !== 'string' || !ref) {
      return NextResponse.json({ error: 'Missing ref' }, { status: 400 })
    }
    const row = await getOrderByRef(ref)
    if (!row) {
      return NextResponse.json({ error: 'Order not found' }, { status: 404 })
    }
    return pdfResponse(orderRowToStoredOrder(row))
  }

  let order: StoredOrder | null
  try {
    order = parseOrder(await readOrderPayload(req))
  } catch {
    order = null
  }
  if (!order) {
    return NextResponse.json({ error: 'Invalid order payload' }, { status: 400 })
  }
  return pdfResponse(order)
}
