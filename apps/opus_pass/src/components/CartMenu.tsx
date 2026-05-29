'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { ShoppingBag, X, ArrowRight } from 'lucide-react'
import { InvitationVisual } from '@/components/guests/InvitationVisual'
import { useCart } from '@/components/providers/CartProvider'

export default function CartMenu() {
  const { items, count, subtotal, removeItem } = useCart()
  const [open, setOpen] = useState(false)

  useEffect(() => {
    if (!open) return
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setOpen(false)
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [open])

  return (
    <div className="relative">
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        aria-label={`Cart${count ? ` — ${count} item${count > 1 ? 's' : ''}` : ', empty'}`}
        aria-expanded={open}
        aria-haspopup="true"
        className="relative flex h-10 w-10 items-center justify-center rounded-full text-gray-700 transition-colors hover:bg-gray-100"
      >
        <ShoppingBag size={20} />
        {count > 0 && (
          <span className="absolute -right-0.5 -top-0.5 flex h-5 min-w-5 items-center justify-center rounded-full bg-(--accent) px-1 text-[11px] font-bold leading-none text-(--on-accent) ring-2 ring-white tabular-nums">
            {count}
          </span>
        )}
      </button>

      {open && (
        <>
          {/* Click-catcher to dismiss */}
          <div className="fixed inset-0 z-40" aria-hidden="true" onClick={() => setOpen(false)} />

          <div
            role="dialog"
            aria-label="Your cart"
            className="absolute right-0 top-[calc(100%+10px)] z-50 w-[min(92vw,360px)] origin-top-right overflow-hidden rounded-2xl border border-gray-200 bg-white shadow-[0_20px_50px_-12px_rgba(0,0,0,0.25)]"
          >
            <div className="flex items-center justify-between border-b border-gray-100 px-4 py-3">
              <p className="text-[13px] font-bold text-gray-900">
                Your cart{count > 0 && <span className="font-medium text-gray-500"> · {count}</span>}
              </p>
              <button
                type="button"
                onClick={() => setOpen(false)}
                aria-label="Close cart"
                className="flex h-7 w-7 items-center justify-center rounded-full text-gray-500 transition hover:bg-gray-100"
              >
                <X size={16} />
              </button>
            </div>

            {items.length === 0 ? (
              <div className="flex flex-col items-center px-6 py-10 text-center">
                <div className="mb-3 flex h-12 w-12 items-center justify-center rounded-full bg-gray-100 text-gray-400">
                  <ShoppingBag size={22} />
                </div>
                <p className="text-[14px] font-bold text-gray-900">Your cart is empty</p>
                <p className="mt-1 text-[12px] leading-snug text-gray-500">
                  Find a design you love and add it here to send to your guests.
                </p>
                <Link
                  href="/invitations"
                  onClick={() => setOpen(false)}
                  className="mt-4 inline-flex items-center gap-1.5 rounded-full bg-(--accent) px-5 py-2.5 text-[12px] font-extrabold uppercase tracking-[0.08em] text-(--on-accent) transition hover:bg-(--accent-hover)"
                >
                  Browse invitations
                  <ArrowRight size={13} />
                </Link>
              </div>
            ) : (
              <>
                <ul className="max-h-[320px] divide-y divide-gray-100 overflow-y-auto">
                  {items.map((item) => (
                    <li key={item.id} className="flex gap-3 px-4 py-3">
                      <Link
                        href={`/invitations/p/${item.id}`}
                        onClick={() => setOpen(false)}
                        className="relative aspect-[5/7] w-12 shrink-0 overflow-hidden rounded-[3px] bg-white shadow-sm ring-1 ring-black/5"
                      >
                        <InvitationVisual treatment={item.treatment} />
                      </Link>
                      <div className="min-w-0 flex-1">
                        <Link
                          href={`/invitations/p/${item.id}`}
                          onClick={() => setOpen(false)}
                          className="block truncate text-[13px] font-bold text-gray-900 hover:underline"
                        >
                          {item.name}
                        </Link>
                        <p className="truncate text-[11px] text-gray-500">{item.summary}</p>
                        <p className="mt-0.5 text-[12px] font-bold text-gray-900 tabular-nums">
                          TZS {item.total.toLocaleString('en-US')}
                        </p>
                      </div>
                      <button
                        type="button"
                        onClick={() => removeItem(item.id)}
                        aria-label={`Remove ${item.name}`}
                        className="self-start text-gray-400 transition hover:text-gray-700"
                      >
                        <X size={15} />
                      </button>
                    </li>
                  ))}
                </ul>

                <div className="border-t border-gray-100 px-4 py-3.5">
                  <div className="mb-3 flex items-baseline justify-between">
                    <span className="text-[12px] font-semibold text-gray-600">Subtotal</span>
                    <span className="text-[16px] font-bold text-gray-900 tabular-nums">
                      TZS {subtotal.toLocaleString('en-US')}
                    </span>
                  </div>
                  <Link
                    href="/invitations/cart"
                    onClick={() => setOpen(false)}
                    className="inline-flex w-full items-center justify-center rounded-full bg-(--accent) px-6 py-3 text-[13px] font-extrabold uppercase tracking-[0.08em] text-(--on-accent) transition hover:bg-(--accent-hover)"
                  >
                    Checkout
                  </Link>
                  <Link
                    href="/invitations"
                    onClick={() => setOpen(false)}
                    className="mt-2 block text-center text-[12px] font-semibold text-gray-600 underline underline-offset-4 hover:text-gray-900"
                  >
                    Continue shopping
                  </Link>
                </div>
              </>
            )}
          </div>
        </>
      )}
    </div>
  )
}
