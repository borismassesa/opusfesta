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
              <div className="bg-white rounded-2xl border border-gray-200 p-8 md:p-10 text-center mb-6">
                <div className="inline-flex w-16 h-16 rounded-full bg-emerald-100 items-center justify-center mb-4">
                  <CheckCircle2 size={32} className="text-emerald-600" />
                </div>
                <h1 className="text-2xl md:text-3xl font-bold text-gray-900 mb-2">
                  {order ? 'Thank you — your invitation is on its way!' : 'No recent order found.'}
                </h1>
                <p className="text-sm text-gray-600 max-w-md mx-auto">
                  {order
                    ? 'Our design team will have your invitation polished and ready to share within 24 hours.'
                    : 'Your last paid order summary will appear here after checkout.'}
                </p>

                {order && (
                  <div className="mt-6 inline-flex flex-col items-center gap-1">
                    <span className="text-xs uppercase tracking-wider text-gray-500 font-semibold">
                      Order reference
                    </span>
                    <span className="text-lg font-mono font-bold text-gray-900">{ref}</span>
                    <span className="text-xs text-gray-500 mt-1">
                      Paid via <strong className="font-semibold text-gray-700">{order.paymentLabel}</strong>
                    </span>
                  </div>
                )}
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-5 mb-6">
                <div className="bg-white rounded-2xl border border-gray-200 p-5">
                  <h2 className="text-sm font-bold text-gray-900 mb-3 inline-flex items-center gap-2">
                    <Calendar size={16} className="text-gray-700" />
                    What happens next
                  </h2>
                  <ol className="space-y-2.5 text-sm text-gray-700">
                    <li className="flex items-start gap-2">
                      <span className="font-bold text-gray-900">1.</span>
                      Our team polishes your design within 24 hours
                    </li>
                    <li className="flex items-start gap-2">
                      <span className="font-bold text-gray-900">2.</span>
                      You approve (or request your free revision)
                    </li>
                    <li className="flex items-start gap-2">
                      <span className="font-bold text-gray-900">3.</span>
                      Guest links go live — share from WhatsApp in seconds
                    </li>
                    <li className="flex items-start gap-2">
                      <span className="font-bold text-gray-900">4.</span>
                      RSVPs collected automatically on your dashboard
                    </li>
                  </ol>
                </div>

                <div className="bg-white rounded-2xl border border-gray-200 p-5">
                  <h2 className="text-sm font-bold text-gray-900 mb-3 inline-flex items-center gap-2">
                    <ShoppingBag size={16} className="text-gray-700" />
                    Order summary
                  </h2>
                  <dl className="text-sm space-y-2">
                    <div className="flex justify-between">
                      <dt className="text-gray-600">{itemCount} {itemCount === 1 ? 'design' : 'designs'}</dt>
                      <dd className="font-medium text-gray-900">{formatTzs(subtotal)}</dd>
                    </div>
                    <div className="flex justify-between">
                      <dt className="text-gray-600">VAT 18%</dt>
                      <dd className="font-medium text-gray-900">+{formatTzs(vat)}</dd>
                    </div>
                    <div className="flex justify-between pt-2 border-t border-gray-100">
                      <dt className="font-bold text-gray-900">Total paid</dt>
                      <dd className="font-bold text-gray-900">{formatTzs(total)}</dd>
                    </div>
                  </dl>
                </div>
              </div>

              {order && (
                <div className="bg-white rounded-2xl border border-gray-200 p-5 mb-6">
                  <h2 className="text-sm font-bold text-gray-900 mb-3">We&apos;ll be in touch</h2>
                  <ul className="text-sm text-gray-700 space-y-2.5">
                    <li className="flex items-center gap-2.5">
                      <Mail size={16} className="text-gray-700 shrink-0" />
                      Confirmation sent to {order.contact.email}
                    </li>
                    <li className="flex items-center gap-2.5">
                      <Smartphone size={16} className="text-gray-700 shrink-0" />
                      WhatsApp updates to {order.contact.phone}
                    </li>
                  </ul>
                </div>
              )}

              <div className="flex flex-wrap items-center justify-center gap-3">
                <Link
                  href="/my"
                  className="h-11 px-6 inline-flex items-center bg-gray-900 text-white text-sm font-semibold rounded-full hover:bg-gray-800 transition"
                >
                  View my orders
                </Link>
                <Link
                  href="/invitations"
                  className="h-11 px-6 inline-flex items-center bg-white text-gray-900 text-sm font-semibold rounded-full border border-gray-300 hover:bg-gray-50 transition"
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
