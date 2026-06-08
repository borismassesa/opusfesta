'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { CheckCircle2, Calendar, Mail, Smartphone, ShoppingBag } from 'lucide-react'
import CheckoutStepper from '@/components/invitations/CheckoutStepper'
import Confetti from '@/components/invitations/Confetti'
import { getLastOrder, type StoredOrder } from '@/lib/cart-storage'

function formatTzs(n: number): string {
  return `TZS ${n.toLocaleString('en-US')}`
}

export default function ConfirmationPage() {
  const [order, setOrder] = useState<StoredOrder | null>(null)
  const [hydrated, setHydrated] = useState(false)

  useEffect(() => {
    setOrder(getLastOrder())
    setHydrated(true)
  }, [])

  const ref = order?.ref ?? 'OF-PENDING'
  const subtotal = order?.subtotal ?? 0
  const vat = order?.vat ?? 0
  const total = order?.total ?? 0
  const itemCount = order?.items.length ?? 0

  return (
    <>
      {hydrated && order && <Confetti />}
      <main className="bg-gray-50 min-h-screen py-8">
        <div className="max-w-7xl mx-auto px-4 lg:px-8">
          <CheckoutStepper current="confirmation" />

          {!hydrated ? (
            <div className="max-w-3xl mx-auto py-14 text-center text-sm text-gray-400">
              Loading your order…
            </div>
          ) : (
            <div className="max-w-3xl mx-auto">
              {/* Hero */}
              <div className="mb-6 rounded-3xl border border-gray-200 bg-white p-8 text-center shadow-[0_4px_30px_-14px_rgba(0,0,0,0.15)] md:p-12">
                <div className="mx-auto mb-5 flex h-20 w-20 items-center justify-center rounded-full bg-emerald-50">
                  <div className="flex h-14 w-14 items-center justify-center rounded-full bg-emerald-100">
                    <CheckCircle2 size={30} strokeWidth={2.25} className="text-emerald-600" />
                  </div>
                </div>
                <h1 className="font-serif text-[28px] font-medium leading-tight text-gray-900 md:text-[34px]">
                  {order ? 'Thank you — your invitation is on its way!' : 'No recent order found.'}
                </h1>
                <p className="mx-auto mt-3 max-w-md text-[14px] leading-relaxed text-gray-600">
                  {order
                    ? 'Our design team will have your invitation polished and ready to share within 24 hours.'
                    : 'Your last paid order summary will appear here after checkout.'}
                </p>

                {order && (
                  <div className="mx-auto mt-8 max-w-xs rounded-2xl border border-dashed border-gray-300 bg-[#FBFAF6] px-6 py-5">
                    <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-gray-400">
                      Order reference
                    </p>
                    <p className="mt-1.5 font-mono text-[19px] font-bold tracking-[0.08em] text-gray-900">
                      {ref}
                    </p>
                    <p className="mt-2.5 text-[11px] text-gray-500">
                      Paid via{' '}
                      <strong className="font-semibold text-gray-700">
                        {order.paymentLabel ?? 'Saved method'}
                      </strong>
                    </p>
                  </div>
                )}
              </div>

              {/* What happens next + Order summary */}
              <div className="mb-6 grid grid-cols-1 gap-5 md:grid-cols-2">
                <div className="rounded-2xl border border-gray-200 bg-white p-6 shadow-[0_2px_16px_-10px_rgba(0,0,0,0.1)]">
                  <h2 className="mb-4 inline-flex items-center gap-2 text-[13px] font-bold text-gray-900">
                    <Calendar size={15} className="text-gray-500" />
                    What happens next
                  </h2>
                  <ol className="space-y-3 text-[13px] text-gray-700">
                    {[
                      'Our team polishes your design within 24 hours',
                      'You approve (or request your free revision)',
                      'Guest links go live — share from WhatsApp in seconds',
                      'RSVPs collected automatically on your dashboard',
                    ].map((step, i) => (
                      <li key={i} className="flex items-start gap-2.5">
                        <span className="mt-px flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-[#1A1A1A] text-[10px] font-bold text-white tabular-nums">
                          {i + 1}
                        </span>
                        <span className="leading-snug">{step}</span>
                      </li>
                    ))}
                  </ol>
                </div>

                <div className="rounded-2xl border border-gray-200 bg-white p-6 shadow-[0_2px_16px_-10px_rgba(0,0,0,0.1)]">
                  <h2 className="mb-4 inline-flex items-center gap-2 text-[13px] font-bold text-gray-900">
                    <ShoppingBag size={15} className="text-gray-500" />
                    Order summary
                  </h2>
                  <dl className="space-y-2.5 text-[13px]">
                    <div className="flex items-baseline justify-between">
                      <dt className="text-gray-600">
                        {itemCount} {itemCount === 1 ? 'design' : 'designs'}
                      </dt>
                      <dd className="font-semibold tabular-nums text-gray-900">{formatTzs(subtotal)}</dd>
                    </div>
                    <div className="flex items-baseline justify-between">
                      <dt className="text-gray-600">VAT 18%</dt>
                      <dd className="font-semibold tabular-nums text-gray-900">+{formatTzs(vat)}</dd>
                    </div>
                    <div className="mt-1 flex items-baseline justify-between border-t border-dashed border-gray-200 pt-3">
                      <dt className="font-bold text-gray-900">Total paid</dt>
                      <dd className="font-serif text-[20px] font-medium tabular-nums text-gray-900">
                        {formatTzs(total)}
                      </dd>
                    </div>
                  </dl>
                </div>
              </div>

              {order && (
                <div className="mb-6 rounded-2xl border border-gray-200 bg-white p-6 shadow-[0_2px_16px_-10px_rgba(0,0,0,0.1)]">
                  <h2 className="mb-3 text-[13px] font-bold text-gray-900">We&apos;ll be in touch</h2>
                  <ul className="space-y-2.5 text-[13px] text-gray-700">
                    <li className="flex items-center gap-2.5">
                      <Mail size={15} className="shrink-0 text-gray-500" />
                      Confirmation sent to <span className="font-medium text-gray-900">{order.contact.email}</span>
                    </li>
                    <li className="flex items-center gap-2.5">
                      <Smartphone size={15} className="shrink-0 text-gray-500" />
                      WhatsApp updates to <span className="font-medium text-gray-900">{order.contact.phone}</span>
                    </li>
                  </ul>
                </div>
              )}

              <div className="flex flex-wrap items-center justify-center gap-3">
                <Link
                  href="/my"
                  className="inline-flex items-center rounded-full bg-[#1A1A1A] px-6 py-3 text-[13px] font-extrabold uppercase tracking-[0.08em] text-white transition hover:bg-[#333]"
                >
                  View my orders
                </Link>
                <Link
                  href="/invitations"
                  className="inline-flex items-center rounded-full border border-gray-300 bg-white px-6 py-3 text-[13px] font-extrabold uppercase tracking-[0.08em] text-gray-900 transition hover:bg-gray-50"
                >
                  Browse more designs
                </Link>
              </div>
            </div>
          )}
        </div>
      </main>
    </>
  )
}
