'use client'

import { useState } from 'react'
import Link from 'next/link'
import {
  Truck,
  BadgePercent,
  Smartphone,
  CreditCard,
  ShieldCheck,
} from 'lucide-react'
import Navbar from '@/components/navbar'
import Footer from '@/components/footer'
import CheckoutStepper from '@/components/attire-and-rings/CheckoutStepper'

type PaymentMethodId = 'mpesa-default' | 'airtel-default' | 'tigo-default' | 'card-default'

type SavedMethod = {
  id: PaymentMethodId
  label: string
  detail: string
  badge: { text: string; bg: string; fg: string }
}

const SAVED_METHODS: SavedMethod[] = [
  {
    id: 'mpesa-default',
    label: 'M-Pesa ending in 4521',
    detail: 'Connected since Oct 2024',
    badge: { text: 'M-PESA', bg: '#dcfce7', fg: '#166534' },
  },
  {
    id: 'airtel-default',
    label: 'Airtel Money ending in 7890',
    detail: 'Connected since Mar 2025',
    badge: { text: 'AIRTEL', bg: '#fee2e2', fg: '#991b1b' },
  },
  {
    id: 'tigo-default',
    label: 'Tigo Pesa ending in 1234',
    detail: 'Connected since Jan 2025',
    badge: { text: 'TIGO', bg: '#dbeafe', fg: '#1e3a8a' },
  },
  {
    id: 'card-default',
    label: 'Visa ending in 7658',
    detail: 'Expiry 10/2027',
    badge: { text: 'VISA', bg: '#eef2ff', fg: '#1e3a8a' },
  },
]

function formatTzs(n: number): string {
  return `TZS ${n.toLocaleString('en-US')}`
}

// Pre-computed from the seeded cart at /attire-and-rings/cart
const SUBTOTAL = 660_000
const SAVINGS = 0
const FITTING_FEE = 0
const VAT = Math.round(SUBTOTAL * 0.18)
const TOTAL = SUBTOTAL + FITTING_FEE + VAT

export default function CheckoutPage() {
  const [selected, setSelected] = useState<PaymentMethodId | 'new-card' | 'new-mobile'>(
    'mpesa-default',
  )
  const [newKind, setNewKind] = useState<'card' | 'mobile'>('card')

  // Card form
  const [cardName, setCardName] = useState('')
  const [cardNumber, setCardNumber] = useState('')
  const [cardExpiry, setCardExpiry] = useState('')
  const [cardCvv, setCardCvv] = useState('')

  // Mobile money form
  const [mobileProvider, setMobileProvider] = useState('M-Pesa')
  const [mobilePhone, setMobilePhone] = useState('')

  return (
    <>
      <Navbar />
      <main className="bg-gray-50 min-h-screen py-8">
        <div className="max-w-7xl mx-auto px-4 lg:px-8">
          <Link
            href="/attire-and-rings/cart"
            className="inline-flex items-center text-sm font-medium text-gray-700 hover:text-gray-900 mb-4"
          >
            ← Back to cart
          </Link>
          <CheckoutStepper current="payment" />
          <div className="grid grid-cols-1 lg:grid-cols-[1fr_360px] gap-6 lg:gap-8">
            {/* LEFT — Payment */}
            <section className="bg-white rounded-2xl border border-gray-200 p-6 md:p-8">
              <h1 className="text-2xl font-bold text-gray-900 mb-6">Payment</h1>

              {/* Saved methods grid */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-6">
                {SAVED_METHODS.map((m) => {
                  const isActive = selected === m.id
                  return (
                    <button
                      key={m.id}
                      type="button"
                      onClick={() => setSelected(m.id)}
                      className={`relative text-left rounded-xl border-2 p-4 transition-colors ${
                        isActive ? 'border-gray-900 bg-white' : 'border-gray-200 bg-white hover:border-gray-400'
                      }`}
                      aria-pressed={isActive}
                    >
                      <span
                        className={`absolute top-4 left-4 w-4 h-4 rounded-full border-2 ${
                          isActive ? 'border-gray-900 bg-gray-900' : 'border-gray-300 bg-white'
                        }`}
                        aria-hidden="true"
                      >
                        {isActive && (
                          <span className="block w-1.5 h-1.5 rounded-full bg-white m-auto mt-[3px]" />
                        )}
                      </span>

                      <div className="pl-8">
                        <p className="text-sm font-semibold text-gray-900">{m.label}</p>
                        <p className="text-xs text-gray-500 mt-0.5">{m.detail}</p>
                        <p className="text-xs text-gray-600 mt-3">
                          <button
                            type="button"
                            onClick={(e) => {
                              e.stopPropagation()
                            }}
                            className="hover:text-red-600 hover:underline"
                          >
                            Delete
                          </button>
                          <span className="mx-2 text-gray-300">|</span>
                          <button
                            type="button"
                            onClick={(e) => e.stopPropagation()}
                            className="hover:text-gray-900 hover:underline"
                          >
                            Edit
                          </button>
                        </p>
                      </div>

                      <span
                        className="absolute right-4 bottom-4 px-2 py-1 rounded text-[10px] font-bold tracking-wide uppercase"
                        style={{ backgroundColor: m.badge.bg, color: m.badge.fg }}
                      >
                        {m.badge.text}
                      </span>
                    </button>
                  )
                })}
              </div>

              {/* OR divider */}
              <div className="flex items-center gap-4 mb-6">
                <div className="flex-1 h-px bg-gray-200" />
                <span className="text-sm text-gray-500">or</span>
                <div className="flex-1 h-px bg-gray-200" />
              </div>

              {/* Add new method */}
              <div className="mb-5">
                <h2 className="text-base font-semibold text-gray-900 mb-3">Add a new payment method</h2>
                <div className="inline-flex rounded-full border border-gray-200 bg-gray-50 p-1 mb-5">
                  <button
                    type="button"
                    onClick={() => {
                      setNewKind('card')
                      setSelected('new-card')
                    }}
                    className={`inline-flex items-center gap-1.5 px-4 py-1.5 rounded-full text-sm font-semibold transition-colors ${
                      newKind === 'card' ? 'bg-white text-gray-900 shadow-sm' : 'text-gray-600 hover:text-gray-900'
                    }`}
                  >
                    <CreditCard size={14} />
                    Card
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setNewKind('mobile')
                      setSelected('new-mobile')
                    }}
                    className={`inline-flex items-center gap-1.5 px-4 py-1.5 rounded-full text-sm font-semibold transition-colors ${
                      newKind === 'mobile' ? 'bg-white text-gray-900 shadow-sm' : 'text-gray-600 hover:text-gray-900'
                    }`}
                  >
                    <Smartphone size={14} />
                    Mobile money
                  </button>
                </div>

                {newKind === 'card' ? (
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-4 gap-y-4">
                    <div className="sm:col-span-1">
                      <label className="block text-sm font-medium text-gray-900 mb-1.5">
                        Full name (as on card) <span className="text-red-600">*</span>
                      </label>
                      <input
                        type="text"
                        value={cardName}
                        onChange={(e) => setCardName(e.target.value)}
                        onFocus={() => setSelected('new-card')}
                        placeholder="Mary Mwakasege"
                        className="w-full h-11 rounded-md border border-gray-300 px-3 text-sm focus:outline-none focus:border-gray-500"
                      />
                    </div>
                    <div className="sm:col-span-1">
                      <label className="block text-sm font-medium text-gray-900 mb-1.5">
                        Card number <span className="text-red-600">*</span>
                      </label>
                      <input
                        type="text"
                        value={cardNumber}
                        onChange={(e) => setCardNumber(e.target.value)}
                        onFocus={() => setSelected('new-card')}
                        placeholder="xxxx xxxx xxxx xxxx"
                        inputMode="numeric"
                        className="w-full h-11 rounded-md border border-gray-300 px-3 text-sm focus:outline-none focus:border-gray-500"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-900 mb-1.5">
                        Card expiration <span className="text-red-600">*</span>
                      </label>
                      <input
                        type="text"
                        value={cardExpiry}
                        onChange={(e) => setCardExpiry(e.target.value)}
                        onFocus={() => setSelected('new-card')}
                        placeholder="MM/YY"
                        inputMode="numeric"
                        className="w-full h-11 rounded-md border border-gray-300 px-3 text-sm focus:outline-none focus:border-gray-500"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-900 mb-1.5">
                        CVV <span className="text-red-600">*</span>
                      </label>
                      <input
                        type="text"
                        value={cardCvv}
                        onChange={(e) => setCardCvv(e.target.value)}
                        onFocus={() => setSelected('new-card')}
                        placeholder="123"
                        inputMode="numeric"
                        maxLength={4}
                        className="w-full h-11 rounded-md border border-gray-300 px-3 text-sm focus:outline-none focus:border-gray-500"
                      />
                    </div>
                  </div>
                ) : (
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-4 gap-y-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-900 mb-1.5">
                        Mobile money provider <span className="text-red-600">*</span>
                      </label>
                      <select
                        value={mobileProvider}
                        onChange={(e) => setMobileProvider(e.target.value)}
                        onFocus={() => setSelected('new-mobile')}
                        className="w-full h-11 rounded-md border border-gray-300 bg-white px-3 text-sm focus:outline-none focus:border-gray-500"
                      >
                        <option>M-Pesa</option>
                        <option>Airtel Money</option>
                        <option>Tigo Pesa</option>
                        <option>HaloPesa</option>
                      </select>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-900 mb-1.5">
                        Phone number <span className="text-red-600">*</span>
                      </label>
                      <input
                        type="tel"
                        value={mobilePhone}
                        onChange={(e) => setMobilePhone(e.target.value)}
                        onFocus={() => setSelected('new-mobile')}
                        placeholder="+255 7xx xxx xxx"
                        inputMode="tel"
                        className="w-full h-11 rounded-md border border-gray-300 px-3 text-sm focus:outline-none focus:border-gray-500"
                      />
                    </div>
                    <p className="sm:col-span-2 text-xs text-gray-500 mt-1">
                      You&apos;ll get a prompt on your phone to approve the payment.
                    </p>
                  </div>
                )}
              </div>

              <Link
                href="/attire-and-rings/confirmation"
                className="w-full h-12 inline-flex items-center justify-center bg-gray-900 text-white font-semibold rounded-md hover:bg-gray-800 transition mt-2"
              >
                Pay {formatTzs(TOTAL)}
              </Link>

              <p className="mt-4 text-xs text-gray-500 inline-flex items-center gap-1.5">
                <ShieldCheck size={13} className="text-emerald-600" />
                Payments are held securely until pickup or delivery — funds release to the vendor after confirmation.
              </p>
            </section>

            {/* RIGHT — Summary + perks */}
            <aside className="space-y-5">
              <div className="rounded-2xl bg-white border border-gray-200 p-5">
                <dl className="space-y-3 text-sm">
                  <div className="flex justify-between">
                    <dt className="text-gray-700">Original price</dt>
                    <dd className="font-medium text-gray-900">{formatTzs(SUBTOTAL + SAVINGS)}</dd>
                  </div>
                  <div className="flex justify-between">
                    <dt className="text-gray-700">Savings</dt>
                    <dd className="font-medium text-emerald-700">
                      {SAVINGS > 0 ? `-${formatTzs(SAVINGS)}` : 'TZS 0'}
                    </dd>
                  </div>
                  <div className="flex justify-between">
                    <dt className="text-gray-700">In-person fitting</dt>
                    <dd className="font-medium text-emerald-700">
                      {FITTING_FEE === 0 ? 'Free' : formatTzs(FITTING_FEE)}
                    </dd>
                  </div>
                  <div className="flex justify-between">
                    <dt className="text-gray-700">
                      VAT <span className="text-gray-500">18%</span>
                    </dt>
                    <dd className="font-medium text-gray-900">+{formatTzs(VAT)}</dd>
                  </div>
                </dl>
                <div className="border-t border-gray-200 my-4" />
                <div className="flex justify-between items-baseline">
                  <span className="text-base font-bold text-gray-900">Total</span>
                  <span className="text-xl font-bold text-gray-900">{formatTzs(TOTAL)}</span>
                </div>
              </div>

              <div className="rounded-2xl bg-white border border-gray-200 p-5">
                <div className="flex items-start gap-3 mb-1">
                  <Truck size={20} className="mt-0.5 text-gray-700 shrink-0" />
                  <p className="text-sm font-semibold text-gray-900">Free delivery in Dar es Salaam</p>
                </div>
                <p className="text-xs text-gray-600 pl-8">
                  Standard delivery 7–14 days. Express (3–5 days) available at checkout for TZS 18,000.
                </p>
              </div>

              <div className="rounded-2xl bg-white border border-gray-200 p-5">
                <div className="flex items-start gap-3 mb-1">
                  <BadgePercent size={20} className="mt-0.5 text-gray-700 shrink-0" />
                  <p className="text-sm font-semibold text-gray-900">Pay 30% deposit today</p>
                </div>
                <p className="text-xs text-gray-600 pl-8">
                  Hold the piece with a deposit of <strong className="font-semibold text-gray-900">{formatTzs(Math.round(TOTAL * 0.3))}</strong>{' '}
                  and settle the balance at your fitting.
                </p>
              </div>

              <p className="text-center text-xs text-gray-500">
                Payments processed securely by{' '}
                <Link href="/" className="font-medium text-gray-900 hover:underline">
                  OpusFesta Pay
                </Link>
              </p>
            </aside>
          </div>
        </div>
      </main>
      <Footer />
    </>
  )
}
