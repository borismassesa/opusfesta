'use client'

import Link from 'next/link'
import { Clock, CheckCircle2, ArrowRight, Receipt } from 'lucide-react'
import { Dialog, Button } from '@/components/dashboard/controls'
import type { StoredOrder } from '@/lib/cart-storage'
import { cn } from '@/lib/utils'

function formatTzs(n: number): string {
  return `TZS ${n.toLocaleString('en-US')}`
}

type PaymentRow = { label: string; value: string; emphasize?: boolean }

/** Structured label/value rows, mirroring the invoice's payment card. Falls
 * back to splitting the legacy one-line paymentLabel for older orders that
 * predate the structured `payment` field. */
function paymentRows(order: StoredOrder): PaymentRow[] {
  const pay = order.payment
  if (pay) {
    const rows: PaymentRow[] = []
    if (pay.cardLast4) rows.push({ label: 'Card', value: `•••• ${pay.cardLast4}` })
    if (pay.payerName) rows.push({ label: 'Paid by', value: pay.payerName })
    if (pay.payerPhone) rows.push({ label: 'Phone', value: pay.payerPhone })
    if (pay.reference) rows.push({ label: 'Reference', value: pay.reference, emphasize: true })
    return rows
  }
  return (order.paymentLabel ?? '')
    .split(' · ')
    .filter(Boolean)
    .map((value) => ({ label: 'Payment', value }))
}

/**
 * Shown right after a pledge/thank-you card template purchase resolves —
 * a receipt-style summary of that one order, plus its live status (payment
 * under review vs. confirmed). Reused by PledgesManager and ThankYouView so
 * both card pickers land the buyer in the same place after paying.
 */
export default function PaymentSummaryModal({ order, onClose }: { order: StoredOrder; onClose: () => void }) {
  const paid = order.paymentStatus === 'paid'
  const item = order.items[0]
  const rows = paymentRows(order)

  return (
    <Dialog
      open
      onClose={onClose}
      title={paid ? 'Payment confirmed' : 'Payment under review'}
      footer={
        <>
          <Link href="/my/dashboard/orders">
            <Button variant="secondary">
              <Receipt className="h-4 w-4" /> View in Orders
            </Button>
          </Link>
          <Button onClick={onClose}>
            Done <ArrowRight className="h-4 w-4" />
          </Button>
        </>
      }
    >
      <div className="space-y-4">
        <div
          className={cn(
            'flex items-start gap-3 rounded-xl border p-4',
            paid ? 'border-emerald-200 bg-emerald-50' : 'border-amber-200 bg-amber-50',
          )}
        >
          <span
            className={cn(
              'flex size-9 shrink-0 items-center justify-center rounded-full',
              paid ? 'bg-emerald-100 text-emerald-700' : 'bg-amber-100 text-amber-700',
            )}
          >
            {paid ? <CheckCircle2 className="h-4.5 w-4.5" /> : <Clock className="h-4.5 w-4.5" />}
          </span>
          <div className="space-y-1">
            <p className={cn('text-sm font-semibold', paid ? 'text-emerald-800' : 'text-amber-800')}>
              {paid ? "You're all set — this design is unlocked" : 'The OpusFesta team is confirming your payment'}
            </p>
            <p className="text-xs leading-relaxed text-[#1A1A1A]/60">
              {paid
                ? 'You can use this design right away.'
                : "We'll approve it shortly. Once confirmed, this design unlocks automatically — no need to pay again."}
            </p>
          </div>
        </div>

        {item ? (
          <div className="flex items-center gap-3 rounded-xl border border-black/[0.08] p-3">
            <div className="relative h-14 w-11 shrink-0 overflow-hidden rounded-md bg-black/[0.04]">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={item.image} alt="" className="h-full w-full object-cover" />
            </div>
            <div className="min-w-0 grow">
              <p className="truncate text-sm font-semibold text-[#1A1A1A]">{item.name}</p>
              <p className="text-xs text-[#1A1A1A]/55">{item.summary}</p>
            </div>
            <span className="shrink-0 text-sm font-bold tabular-nums text-[#1A1A1A]">{formatTzs(item.total)}</span>
          </div>
        ) : null}

        <dl className="grid grid-cols-2 gap-3 text-sm">
          <div>
            <dt className="text-xs text-[#1A1A1A]/50">Order</dt>
            <dd className="font-semibold text-[#1A1A1A]">#{order.ref}</dd>
          </div>
          <div>
            <dt className="text-xs text-[#1A1A1A]/50">Total</dt>
            <dd className="font-semibold text-[#1A1A1A] tabular-nums">{formatTzs(order.total)}</dd>
          </div>
        </dl>

        {rows.length > 0 ? (
          <div className="overflow-hidden rounded-xl border border-black/[0.08]">
            {order.payment?.provider ? (
              <div className="flex items-center justify-between border-b border-black/[0.08] bg-black/[0.02] px-3 py-2">
                <span className="text-xs font-medium text-[#1A1A1A]/50">Payment method</span>
                <span className="text-sm font-semibold text-[#1A1A1A]">{order.payment.provider}</span>
              </div>
            ) : null}
            <div className="divide-y divide-black/[0.06] px-3">
              {rows.map((row) => (
                <div key={row.label} className="flex items-center justify-between gap-3 py-2 text-sm">
                  <span className="text-[#1A1A1A]/55">{row.label}</span>
                  <span
                    className={cn(
                      'text-right text-[#1A1A1A]',
                      row.emphasize ? 'font-semibold tabular-nums' : 'font-medium',
                    )}
                  >
                    {row.value}
                  </span>
                </div>
              ))}
            </div>
          </div>
        ) : null}
      </div>
    </Dialog>
  )
}
