import { NextResponse, type NextRequest } from 'next/server'
import { renderToBuffer, type DocumentProps } from '@react-pdf/renderer'
import { createElement, type ReactElement } from 'react'
import { InvoicePdf } from '@/lib/invoice-pdf'
import { MAX_ORDER_BODY_BYTES, parseOrder, readOrderPayload } from '@/lib/order-payload'
import type { StoredOrder } from '@/lib/cart-storage'

export const runtime = 'nodejs'

export async function POST(req: NextRequest) {
  const length = Number(req.headers.get('content-length') ?? 0)
  if (length > MAX_ORDER_BODY_BYTES) {
    return NextResponse.json({ error: 'Payload too large' }, { status: 413 })
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
