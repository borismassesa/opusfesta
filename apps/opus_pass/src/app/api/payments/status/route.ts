import { NextResponse } from 'next/server'
import { getOrderByRef, transitionOrder } from '@/lib/payments/orders'
import { isSelcomConfigured, queryOrderStatus, mapSelcomStatus } from '@/lib/payments/selcom'
import { isTerminal, type StatusResponse } from '@/lib/payments/types'

export const dynamic = 'force-dynamic'
export const runtime = 'nodejs'

// Polled by the checkout page while the customer enters their PIN, and by the
// confirmation page after a card redirect. When the order is still pending we
// re-query Selcom directly — so payment resolves even if the webhook is delayed
// or (in local dev) can't reach the server.
export async function GET(req: Request): Promise<NextResponse> {
  const ref = new URL(req.url).searchParams.get('ref')?.trim()
  if (!ref) return NextResponse.json({ message: 'Missing ref.' }, { status: 400 })

  const order = await getOrderByRef(ref)
  if (!order) return NextResponse.json({ message: 'Order not found.' }, { status: 404 })

  let status = order.status
  if (order.provider === 'selcom' && !isTerminal(status) && isSelcomConfigured()) {
    try {
      const res = await queryOrderStatus(ref)
      const confirmed = mapSelcomStatus(res.data?.[0]?.payment_status ?? res.result)
      if (confirmed === 'paid') status = await transitionOrder(ref, 'paid')
      else if (confirmed === 'failed') status = await transitionOrder(ref, 'failed')
    } catch (err) {
      console.error('[payments] status re-query failed', err)
    }
  }

  const payload: StatusResponse = {
    ref: order.ref,
    status,
    amountTotal: Number(order.amount_total),
    currency: order.currency,
    paymentLabel: order.payment_label ?? undefined,
    paidAt: order.paid_at ?? undefined,
  }
  return NextResponse.json(payload)
}
