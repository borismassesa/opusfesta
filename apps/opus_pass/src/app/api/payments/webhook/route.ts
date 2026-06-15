import { NextResponse } from 'next/server'
import { getOrderByRef, recordPaymentEvent, transitionOrder } from '@/lib/payments/orders'
import { queryOrderStatus, mapSelcomStatus } from '@/lib/payments/selcom'
import type { OrderStatus } from '@/lib/payments/types'

export const dynamic = 'force-dynamic'
export const runtime = 'nodejs'

// Selcom calls this server-to-server after a payment resolves. We do NOT trust
// the callback body's status on its own — we re-query Selcom's order-status API
// and flip the DB only on that confirmed read. The event log gives idempotency,
// so a replayed callback is a harmless no-op.

type Callback = {
  order_id?: string
  transid?: string
  reference?: string
  result?: string
  resultcode?: string
  payment_status?: string
}

async function parseBody(req: Request): Promise<Callback> {
  const ct = req.headers.get('content-type') ?? ''
  if (ct.includes('application/json')) {
    return (await req.json().catch(() => ({}))) as Callback
  }
  // Selcom may post form-encoded.
  const form = await req.formData().catch(() => null)
  if (!form) return {}
  const obj: Record<string, string> = {}
  for (const [k, v] of form.entries()) obj[k] = String(v)
  return obj as Callback
}

export async function POST(req: Request): Promise<NextResponse> {
  const body = await parseBody(req)
  const ref = body.order_id
  if (!ref) {
    // Nothing actionable — ack so Selcom doesn't retry forever.
    return NextResponse.json({ received: true })
  }

  const order = await getOrderByRef(ref)
  if (!order) {
    console.warn('[payments] webhook for unknown order', ref)
    return NextResponse.json({ received: true })
  }

  // Idempotency: a repeat of the same event is dropped. Fall back to a
  // deterministic key when the callback carries neither a transid nor a
  // reference, so a duplicate of such a callback still dedupes (SQL NULLs don't
  // collide on the UNIQUE index, so a literal null would let repeats through).
  const callbackStatus = mapSelcomStatus(body.payment_status ?? body.result)
  const eventId = body.transid ?? body.reference ?? `${ref}:${callbackStatus}`
  const isNew = await recordPaymentEvent({
    orderId: order.id,
    providerEventId: eventId,
    status: callbackStatus as OrderStatus,
    rawPayload: body,
  })
  if (!isNew) return NextResponse.json({ received: true, duplicate: true })

  // SECURITY: never trust the callback body to move money. The webhook is
  // unauthenticated and forgeable, so a transition is driven ONLY by a
  // server-side re-query of Selcom's order-status API. If that query fails we
  // leave the order pending and defer — the status poll (or a later callback)
  // resolves it. Trusting the callback status here would let a forged "paid"
  // callback mark an order paid whenever Selcom is unreachable.
  let confirmed: 'paid' | 'failed' | 'pending'
  try {
    const status = await queryOrderStatus(ref)
    confirmed = mapSelcomStatus(status.data?.[0]?.payment_status ?? status.result)
  } catch (err) {
    console.error('[payments] order-status confirm failed; leaving order pending', err)
    return NextResponse.json({ received: true, deferred: true })
  }

  if (confirmed === 'paid') {
    await transitionOrder(ref, 'paid')
  } else if (confirmed === 'failed') {
    await transitionOrder(ref, 'failed')
  }
  // `pending` → leave as-is; a later callback will resolve it.

  return NextResponse.json({ received: true })
}
