'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { CheckCircle2, Calendar, MapPin, Mail, Smartphone, ShoppingBag } from 'lucide-react'
import Navbar from '@/components/navbar'
import Footer from '@/components/footer'
import CheckoutStepper from '@/components/attire-and-rings/CheckoutStepper'
import Confetti from '@/components/attire-and-rings/Confetti'
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
  const itemCount = order?.items.reduce((s, i) => s + i.quantity, 0) ?? 0
  const cityLine = order ? `${order.address.city}, Tanzania` : ''

  return (
    <>
      <Navbar />
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
                {order ? 'Thank you, your order is in.' : 'No recent order found.'}
              </h1>
              <p className="text-sm text-gray-600 max-w-md mx-auto">
                {order
                  ? `The boutique has been notified and will message you within a day to schedule your first fitting${cityLine ? ` in ${cityLine}` : ''}.`
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
                    The boutique confirms availability within 24h
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="font-bold text-gray-900">2.</span>
                    You book a fitting (in-person or virtual)
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="font-bold text-gray-900">3.</span>
                    Your piece is finished and dispatched
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="font-bold text-gray-900">4.</span>
                    You confirm receipt — funds release to the maker
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
                    <dt className="text-gray-600">{itemCount} {itemCount === 1 ? 'item' : 'items'}</dt>
                    <dd className="font-medium text-gray-900">{formatTzs(subtotal)}</dd>
                  </div>
                  <div className="flex justify-between">
                    <dt className="text-gray-600">VAT 18%</dt>
                    <dd className="font-medium text-gray-900">+{formatTzs(vat)}</dd>
                  </div>
                  <div className="flex justify-between">
                    <dt className="text-gray-600">Delivery</dt>
                    <dd className="font-medium text-emerald-700">Free</dd>
                  </div>
                  <div className="flex justify-between pt-2 border-t border-gray-100">
                    <dt className="font-bold text-gray-900">Total paid</dt>
                    <dd className="font-bold text-gray-900">{formatTzs(total)}</dd>
                  </div>
                </dl>
              </div>
            </div>

            <div className="bg-white rounded-2xl border border-gray-200 p-5 mb-6">
              <h2 className="text-sm font-bold text-gray-900 mb-3">We&apos;ll be in touch</h2>
              <ul className="text-sm text-gray-700 space-y-2.5">
                <li className="flex items-center gap-2.5">
                  <Mail size={16} className="text-gray-700 shrink-0" />
                  Email receipt sent to your account address
                </li>
                <li className="flex items-center gap-2.5">
                  <Smartphone size={16} className="text-gray-700 shrink-0" />
                  SMS confirmation within 5 minutes
                  {order ? ` to ${order.address.phone}` : ''}
                </li>
                <li className="flex items-center gap-2.5">
                  <MapPin size={16} className="text-gray-700 shrink-0" />
                  Fitting reminders 48h before the appointment
                </li>
              </ul>
            </div>

            <div className="flex flex-wrap items-center justify-center gap-3">
              <Link
                href="/my"
                className="h-11 px-6 inline-flex items-center bg-gray-900 text-white text-sm font-semibold rounded-full hover:bg-gray-800 transition"
              >
                View my orders
              </Link>
              <Link
                href="/attire-and-rings/bridal-collection"
                className="h-11 px-6 inline-flex items-center bg-white text-gray-900 text-sm font-semibold rounded-full border border-gray-300 hover:bg-gray-50 transition"
              >
                Keep shopping
              </Link>
            </div>
          </div>
          )}
        </div>
      </main>
      <Footer />
    </>
  )
}
