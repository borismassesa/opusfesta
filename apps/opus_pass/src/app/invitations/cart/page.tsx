'use client'

import Link from 'next/link'
import { ShoppingBag, Trash2, ShieldCheck, ArrowRight } from 'lucide-react'
import CheckoutStepper from '@/components/invitations/CheckoutStepper'
import { InvitationVisual } from '@/components/guests/InvitationVisual'
import { useCart } from '@/components/providers/CartProvider'

function formatTzs(n: number): string {
  return `TZS ${n.toLocaleString('en-US')}`
}

function PaymentChips() {
  const methods = ['M-Pesa', 'Airtel', 'Tigo', 'Card']
  return (
    <div className="flex flex-wrap items-center gap-1.5">
      {methods.map((m) => (
        <span
          key={m}
          className="rounded-md border border-gray-200 bg-gray-50 px-2.5 py-1 text-[10px] font-semibold text-gray-600"
        >
          {m}
        </span>
      ))}
    </div>
  )
}

export default function CartPage() {
  const { items, subtotal, removeItem } = useCart()
  const vat = Math.round(subtotal * 0.18)
  const total = subtotal + vat

  return (
    <>
      <main className="bg-gray-50 min-h-screen py-8">
        <div className="max-w-7xl mx-auto px-4 lg:px-8">
          <Link
            href="/invitations"
            className="inline-flex items-center text-sm font-medium text-gray-700 hover:text-gray-900 mb-4"
          >
            ← Continue shopping
          </Link>
          <CheckoutStepper current="cart" />

          <div className="grid grid-cols-1 lg:grid-cols-[1fr_360px] gap-6 lg:gap-8">
            {/* LEFT — Cart items */}
            <section>
              <div className="flex items-end justify-between mb-5">
                <h1 className="text-2xl font-bold text-gray-900">Your Cart</h1>
                <p className="text-sm text-gray-600">
                  {items.length} {items.length === 1 ? 'design' : 'designs'}
                </p>
              </div>

              <div className="rounded-2xl bg-white border border-gray-200 px-5">
                {items.length === 0 ? (
                  <div className="py-14 text-center">
                    <div className="inline-flex h-12 w-12 items-center justify-center rounded-full bg-gray-100 text-gray-400 mb-3">
                      <ShoppingBag size={22} />
                    </div>
                    <p className="text-sm font-semibold text-gray-700">Your cart is empty.</p>
                    <p className="text-xs text-gray-500 mt-1">
                      Browse invitation designs and add one to get started.
                    </p>
                    <Link
                      href="/invitations"
                      className="mt-4 inline-block rounded-full bg-gray-900 px-5 py-2.5 text-sm font-semibold text-white hover:bg-gray-800 transition"
                    >
                      Browse invitations
                    </Link>
                  </div>
                ) : (
                  <div className="divide-y divide-gray-100">
                    {items.map((item) => (
                      <div key={item.id} className="flex items-center gap-4 py-5">
                        <Link
                          href={`/invitations/p/${item.id}`}
                          className="relative aspect-[5/7] w-20 shrink-0 overflow-hidden rounded-[3px] bg-white shadow-sm ring-1 ring-black/5"
                        >
                          <InvitationVisual treatment={item.treatment} />
                        </Link>

                        <div className="flex-1 min-w-0">
                          <Link
                            href={`/invitations/p/${item.id}`}
                            className="text-sm font-semibold text-gray-900 hover:underline line-clamp-1"
                          >
                            {item.name}
                          </Link>
                          <p className="text-xs text-gray-500 mt-0.5">By {item.designer}</p>
                          {item.tier || item.guests != null || item.addOns?.length ? (
                            <div className="mt-1.5 space-y-1.5">
                              <div className="flex flex-wrap items-center gap-1.5">
                                {item.tier &&
                                  (() => {
                                    const key = (item.tierId ?? item.tier ?? '').toLowerCase()
                                    const pill =
                                      key === 'classic'
                                        ? 'bg-[#EFE3FA] text-[#6B4E8C]'
                                        : key === 'signature'
                                          ? 'bg-[#F5EACF] text-[#8A6B1E]'
                                          : 'bg-gray-100 text-gray-700'
                                    return (
                                      <span
                                        className={`rounded px-1.5 py-0.5 text-[10px] font-bold uppercase tracking-wide ${pill}`}
                                      >
                                        {item.tier} Package
                                      </span>
                                    )
                                  })()}
                                {item.guests != null && (
                                  <span className="text-xs text-gray-500">
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
                            <p className="text-xs text-gray-500 mt-1 line-clamp-1">{item.summary}</p>
                          )}
                        </div>

                        <span className="font-bold text-gray-900 text-sm shrink-0">
                          {formatTzs(item.total)}
                        </span>

                        <button
                          type="button"
                          onClick={() => removeItem(item.id)}
                          aria-label={`Remove ${item.name} from cart`}
                          className="shrink-0 text-gray-400 hover:text-red-600 transition-colors"
                        >
                          <Trash2 size={18} />
                        </button>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </section>

            {/* RIGHT — Sidebar */}
            <aside className="space-y-5">
              <div className="rounded-2xl border border-gray-200 bg-white p-6 shadow-[0_2px_18px_-10px_rgba(0,0,0,0.15)]">
                <h2 className="text-[11px] font-bold uppercase tracking-[0.18em] text-gray-500">
                  Price details
                </h2>

                <dl className="mt-4 space-y-2.5 text-[13px]">
                  <div className="flex items-baseline justify-between">
                    <dt className="text-gray-600">Subtotal</dt>
                    <dd className="font-semibold tabular-nums text-gray-900">{formatTzs(subtotal)}</dd>
                  </div>
                  <div className="flex items-baseline justify-between">
                    <dt className="text-gray-600">
                      VAT <span className="text-gray-400">(18%)</span>
                    </dt>
                    <dd className="font-semibold tabular-nums text-gray-900">+{formatTzs(vat)}</dd>
                  </div>
                </dl>

                <div className="my-4 border-t border-dashed border-gray-200" />

                <div className="flex items-end justify-between">
                  <span className="text-[14px] font-bold text-gray-900">Total</span>
                  <span className="font-serif text-[26px] font-medium leading-none tabular-nums text-gray-900">
                    {formatTzs(total)}
                  </span>
                </div>

                <Link
                  href={items.length === 0 ? '#' : '/invitations/address'}
                  aria-disabled={items.length === 0}
                  className={`mt-6 inline-flex w-full items-center justify-center gap-2 whitespace-nowrap rounded-full px-6 py-3.5 text-[13px] font-extrabold uppercase tracking-[0.06em] transition ${
                    items.length === 0
                      ? 'pointer-events-none cursor-not-allowed bg-gray-200 text-gray-400'
                      : 'bg-(--accent) text-(--on-accent) hover:bg-(--accent-hover)'
                  }`}
                >
                  Continue to checkout
                  {items.length > 0 && <ArrowRight size={15} className="shrink-0" />}
                </Link>

                <div className="mt-6 border-t border-gray-100 pt-4">
                  <p className="mb-2 text-[10px] font-bold uppercase tracking-[0.16em] text-gray-400">
                    We accept
                  </p>
                  <PaymentChips />
                </div>
              </div>

              {items.length > 0 && (
                <p className="flex items-center justify-center gap-1.5 text-xs text-gray-600">
                  <ShieldCheck size={13} className="text-emerald-600" />
                  Secure checkout · designs delivered within 24 hours
                </p>
              )}
            </aside>
          </div>
        </div>
      </main>
    </>
  )
}
