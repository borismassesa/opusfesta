'use client'

import Link from 'next/link'
import { Clock, CheckCircle2, ArrowRight, Receipt, Download } from 'lucide-react'
import { Dialog, Button } from '@/components/dashboard/controls'
import type { StoredOrder } from '@/lib/cart-storage'
import { downloadInvoice } from '@/lib/invoice'
import { cn } from '@/lib/utils'

function formatTzs(n: number): string {
  return `TZS ${n.toLocaleString('en-US')}`
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

  return (
    <Dialog
      open
      onClose={onClose}
      title={paid ? 'Payment confirmed' : 'Payment under review'}
      footer={
        <>
          <Button variant="secondary" onClick={() => downloadInvoice(order)}>
            <Download className="h-4 w-4" /> Download receipt
          </Button>
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
          {order.paymentLabel ? (
            <div className="col-span-2">
              <dt className="text-xs text-[#1A1A1A]/50">Payment</dt>
              <dd className="text-[#1A1A1A]">{order.paymentLabel}</dd>
            </div>
          ) : null}
        </dl>
      </div>
    </Dialog>
  )
}
