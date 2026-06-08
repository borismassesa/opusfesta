'use client'

import { useEffect, useState } from 'react'
import { createPortal } from 'react-dom'
import Link from 'next/link'
import { ShoppingBag, X, ArrowRight } from 'lucide-react'
import { cn } from '@/lib/utils'
import { InvitationVisual } from '@/components/guests/InvitationVisual'
import { useCart } from '@/components/providers/CartProvider'

export default function CartMenu() {
  const { items, count, subtotal, removeItem } = useCart()
  const [open, setOpen] = useState(false)
  const [mounted, setMounted] = useState(false)

  // Portal target only exists on the client.
  useEffect(() => setMounted(true), [])

  // Esc to close + lock body scroll while the drawer is open.
  useEffect(() => {
    if (!open) return
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setOpen(false)
    }
    window.addEventListener('keydown', onKey)
    const prevOverflow = document.body.style.overflow
    document.body.style.overflow = 'hidden'
    return () => {
      window.removeEventListener('keydown', onKey)
      document.body.style.overflow = prevOverflow
    }
  }, [open])

  const drawer = (
    <>
      {/* Dimmed backdrop */}
      <div
        className={cn(
          'fixed inset-0 z-[60] bg-black/40 transition-opacity duration-300',
          open ? 'opacity-100' : 'pointer-events-none opacity-0',
        )}
        aria-hidden="true"
        onClick={() => setOpen(false)}
      />

      {/* Right-side drawer */}
      <div
        role="dialog"
        aria-label="Your cart"
        aria-modal="true"
        className={cn(
          'fixed right-0 top-0 z-[61] flex h-full w-[min(94vw,420px)] flex-col bg-white shadow-[-16px_0_48px_-16px_rgba(0,0,0,0.35)] transition-transform duration-300 ease-out',
          open ? 'translate-x-0' : 'translate-x-full',
        )}
      >
        {/* Header */}
        <div className="flex items-center justify-between border-b border-gray-100 px-5 py-4">
          <p className="text-[16px] font-bold text-gray-900">
            Your cart{count > 0 && <span className="font-medium text-gray-500"> · {count}</span>}
          </p>
          <button
            type="button"
            onClick={() => setOpen(false)}
            aria-label="Close cart"
            className="flex h-8 w-8 items-center justify-center rounded-full text-gray-500 transition hover:bg-gray-100"
          >
            <X size={18} />
          </button>
        </div>

        {items.length === 0 ? (
          <div className="flex flex-1 flex-col items-center justify-center px-6 text-center">
            <div className="mb-4 flex h-14 w-14 items-center justify-center rounded-full bg-gray-100 text-gray-400">
              <ShoppingBag size={26} />
            </div>
            <p className="text-[15px] font-bold text-gray-900">Your cart is empty</p>
            <p className="mt-1.5 max-w-[16rem] text-[13px] leading-snug text-gray-500">
              Find a design you love and add it here to send to your guests.
            </p>
            <Link
              href="/invitations"
              onClick={() => setOpen(false)}
              className="mt-5 inline-flex items-center gap-1.5 rounded-full bg-(--accent) px-6 py-3 text-[12px] font-extrabold uppercase tracking-[0.08em] text-(--on-accent) transition hover:bg-(--accent-hover)"
            >
              Browse invitations
              <ArrowRight size={14} />
            </Link>
          </div>
        ) : (
          <>
            {/* Items — scrolls; header + footer stay fixed */}
            <ul className="flex-1 divide-y divide-gray-100 overflow-y-auto">
              {items.map((item) => (
                <li key={item.id} className="flex gap-3.5 px-5 py-4">
                  <Link
                    href={`/invitations/p/${item.id}`}
                    onClick={() => setOpen(false)}
                    className="relative aspect-[5/7] w-14 shrink-0 overflow-hidden rounded-[3px] bg-white shadow-sm ring-1 ring-black/5"
                  >
                    <InvitationVisual treatment={item.treatment} />
                  </Link>
                  <div className="min-w-0 flex-1">
                    <Link
                      href={`/invitations/p/${item.id}`}
                      onClick={() => setOpen(false)}
                      className="block truncate text-[14px] font-bold text-gray-900 hover:underline"
                    >
                      {item.name}
                    </Link>
                    {item.tier || item.guests != null || item.addOns?.length ? (
                      <div className="mt-1 space-y-1.5">
                        <div className="flex flex-wrap items-center gap-1.5">
                          {item.tier &&
                            (() => {
                              const key = (item.tierId ?? item.tier ?? '').toLowerCase()
                              return (
                                <span
                                  className={cn(
                                    'rounded px-1.5 py-0.5 text-[10px] font-bold uppercase tracking-wide',
                                    key === 'classic'
                                      ? 'bg-[#EFE3FA] text-[#6B4E8C]' // lavender
                                      : key === 'signature'
                                        ? 'bg-[#F5EACF] text-[#8A6B1E]' // gold
                                        : 'bg-gray-100 text-gray-700', // neutral
                                  )}
                                >
                                  {item.tier} Package
                                </span>
                              )
                            })()}
                          {item.guests != null && (
                            <span className="text-[12px] text-gray-500">
                              {item.guests.toLocaleString('en-US')} guests
                            </span>
                          )}
                        </div>
                        {item.addOns && item.addOns.length > 0 && (
                          <div className="flex flex-wrap gap-1">
                            {item.addOns.map((a) => (
                              <span
                                key={a}
                                className="rounded-full bg-gray-50 px-2 py-0.5 text-[10px] text-gray-600 ring-1 ring-gray-200"
                              >
                                + {a}
                              </span>
                            ))}
                          </div>
                        )}
                      </div>
                    ) : (
                      <p className="truncate text-[12px] text-gray-500">{item.summary}</p>
                    )}
                    <p className="mt-1.5 text-[13px] font-bold text-gray-900 tabular-nums">
                      TZS {item.total.toLocaleString('en-US')}
                    </p>
                  </div>
                  <button
                    type="button"
                    onClick={() => removeItem(item.id)}
                    aria-label={`Remove ${item.name}`}
                    className="self-start text-gray-400 transition hover:text-gray-700"
                  >
                    <X size={16} />
                  </button>
                </li>
              ))}
            </ul>

            {/* Footer */}
            <div className="border-t border-gray-100 px-5 py-5">
              <div className="mb-4 flex items-baseline justify-between">
                <span className="text-[13px] font-semibold text-gray-600">Subtotal</span>
                <span className="text-[18px] font-bold text-gray-900 tabular-nums">
                  TZS {subtotal.toLocaleString('en-US')}
                </span>
              </div>
              <Link
                href="/invitations/cart"
                onClick={() => setOpen(false)}
                className="inline-flex w-full items-center justify-center rounded-full bg-(--accent) px-6 py-3.5 text-[13px] font-extrabold uppercase tracking-[0.08em] text-(--on-accent) transition hover:bg-(--accent-hover)"
              >
                Checkout
              </Link>
              <button
                type="button"
                onClick={() => setOpen(false)}
                className="mt-3 block w-full text-center text-[12px] font-semibold text-gray-600 underline underline-offset-4 hover:text-gray-900"
              >
                Continue shopping
              </button>
            </div>
          </>
        )}
      </div>
    </>
  )

  return (
    <>
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        aria-label={`Cart${count ? ` — ${count} item${count > 1 ? 's' : ''}` : ', empty'}`}
        aria-expanded={open}
        aria-haspopup="dialog"
        className="relative flex h-10 w-10 items-center justify-center rounded-full text-gray-700 transition-colors hover:bg-gray-100"
      >
        <ShoppingBag size={20} />
        {count > 0 && (
          <span className="absolute -right-0.5 -top-0.5 flex h-5 min-w-5 items-center justify-center rounded-full bg-(--accent) px-1 text-[11px] font-bold leading-none text-(--on-accent) ring-2 ring-white tabular-nums">
            {count}
          </span>
        )}
      </button>

      {mounted && createPortal(drawer, document.body)}
    </>
  )
}
