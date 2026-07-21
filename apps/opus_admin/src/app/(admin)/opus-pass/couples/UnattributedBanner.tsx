'use client'

import { useState } from 'react'
import Link from 'next/link'
import { AlertTriangle, ChevronDown } from 'lucide-react'
import type { UnlinkedOrder } from './queries'

/**
 * Sits below the stat cards, not among them: this is an exception to act on,
 * not a metric to track, and it disappears entirely once every order is
 * attached. Collapsed by default so it stays a one-line nudge.
 */
export default function UnattributedBanner({ orders }: { orders: UnlinkedOrder[] }) {
  const [open, setOpen] = useState(false)
  const total = orders.reduce((sum, o) => sum + o.amountTotal, 0)
  const matched = orders.filter((o) => o.matchedUserId).length

  return (
    <div className="mt-4 rounded-2xl border border-amber-200 bg-amber-50/70">
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        className="flex w-full items-center gap-3 px-5 py-4 text-left"
        aria-expanded={open}
      >
        <AlertTriangle className="h-4 w-4 shrink-0 text-amber-600" />
        <p className="min-w-0 flex-1 text-sm text-amber-900">
          <span className="font-semibold">
            {orders.length} order{orders.length === 1 ? '' : 's'} worth TZS {total.toLocaleString('en-US')} not attached
            to an account
          </span>
          <span className="text-amber-800">
            {' '}
            · bought without signing in
            {matched > 0 ? `, ${matched} matched by email` : ''}
          </span>
        </p>
        <ChevronDown className={`h-4 w-4 shrink-0 text-amber-600 transition ${open ? 'rotate-180' : ''}`} />
      </button>

      {open ? (
        <div className="border-t border-amber-200 px-5 py-4">
          <p className="text-sm text-amber-800">
            These do not count towards the couple&apos;s credits or pledge eligibility. Open the couple and link the
            order from their Orders tab.
          </p>
          <ul className="mt-3 space-y-2">
            {orders.map((order) => (
              <li key={order.orderId} className="flex flex-wrap items-center gap-x-3 gap-y-1 text-sm">
                <span className="font-semibold text-amber-900">{order.ref}</span>
                <span className="tabular-nums text-amber-900">
                  {order.currency} {order.amountTotal.toLocaleString('en-US')}
                </span>
                <span className="text-amber-700">{order.contactEmail || 'no email on order'}</span>
                {order.matchedUserId ? (
                  <Link
                    href={`/opus-pass/couples/${order.matchedUserId}`}
                    className="font-semibold text-[#7E5896] underline-offset-2 hover:underline"
                  >
                    {order.matchedCoupleName}
                  </Link>
                ) : (
                  <span className="text-amber-600">no matching account</span>
                )}
              </li>
            ))}
          </ul>
        </div>
      ) : null}
    </div>
  )
}
