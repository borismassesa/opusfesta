'use client'

import Link from 'next/link'
import { ShoppingBag, Trash2, ShieldCheck } from 'lucide-react'
import CheckoutStepper from '@/components/invitations/CheckoutStepper'
import { InvitationVisual } from '@/components/guests/InvitationVisual'
import { useCart } from '@/components/providers/CartProvider'

function formatTzs(n: number): string {
  return `TZS ${n.toLocaleString('en-US')}`
}

function PaymentChips() {
  const chips: { label: string; bg: string; fg: string }[] = [
    { label: 'M-Pesa', bg: '#dcfce7', fg: '#166534' },
    { label: 'Airtel', bg: '#fee2e2', fg: '#991b1b' },
    { label: 'Tigo', bg: '#dbeafe', fg: '#1e3a8a' },
    { label: 'Card', bg: '#f3f4f6', fg: '#1f2937' },
  ]
  return (
    <div className="flex items-center gap-1.5">
      {chips.map((c) => (
        <span
          key={c.label}
          className="px-2 py-1 rounded text-[10px] font-bold tracking-wide uppercase"
          style={{ backgroundColor: c.bg, color: c.fg }}
        >
          {c.label}
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
                          <p className="text-xs text-gray-500 mt-1 line-clamp-1">{item.summary}</p>
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
              <div className="rounded-2xl bg-white border border-gray-200 p-5">
                <h2 className="text-lg font-bold text-gray-900 mb-4">Price Details</h2>
                <dl className="space-y-3 text-sm">
                  <div className="flex justify-between">
                    <dt className="text-gray-700">Subtotal</dt>
                    <dd className="font-medium text-gray-900">{formatTzs(subtotal)}</dd>
                  </div>
                  <div className="flex justify-between">
                    <dt className="text-gray-700">
                      VAT <span className="text-gray-500">18%</span>
                    </dt>
                    <dd className="font-medium text-gray-900">+{formatTzs(vat)}</dd>
                  </div>
                </dl>

                <div className="border-t border-gray-200 my-4" />

                <div className="flex justify-between items-baseline mb-5">
                  <span className="text-base font-bold text-gray-900">Total</span>
                  <span className="text-xl font-bold text-gray-900">{formatTzs(total)}</span>
                </div>

                <Link
                  href={items.length === 0 ? '#' : '/invitations/address'}
                  aria-disabled={items.length === 0}
                  className={`w-full h-11 inline-flex items-center justify-center font-semibold rounded-md transition ${
                    items.length === 0
                      ? 'bg-gray-300 text-white cursor-not-allowed pointer-events-none'
                      : 'bg-gray-900 text-white hover:bg-gray-800'
                  }`}
                >
                  Continue to contact details
                </Link>

                <div className="mt-4 flex items-center justify-between gap-3 text-xs text-gray-600">
                  <span className="font-medium">We accept:</span>
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
