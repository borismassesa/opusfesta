'use client'

import { useEffect, useMemo, useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import {
  Smartphone,
  CreditCard,
  ShieldCheck,
  AlertCircle,
  Mail,
} from 'lucide-react'
import CheckoutStepper from '@/components/invitations/CheckoutStepper'
import { useCart } from '@/components/providers/CartProvider'
import {
  getContact,
  generateOrderRef,
  setLastOrder,
  type StoredContact,
} from '@/lib/cart-storage'

type PaymentMethodId =
  | 'mpesa-default'
  | 'airtel-default'
  | 'tigo-default'
  | 'card-default'
  | 'new-card'
  | 'new-mobile'

type SavedMethod = {
  id: Extract<PaymentMethodId, 'mpesa-default' | 'airtel-default' | 'tigo-default' | 'card-default'>
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

const PHONE_RE = /^\+?(?:[\d](?:[\s().-]?)){9,}$/
const CARD_NUMBER_RE = /^\d{13,19}$/
const EXPIRY_RE = /^(0[1-9]|1[0-2])\/\d{2}$/
const CVV_RE = /^\d{3,4}$/

function isExpiryInPast(value: string): boolean {
  const m = value.match(EXPIRY_RE)
  if (!m) return false
  const month = Number(m[1])
  const year = 2000 + Number(value.slice(3, 5))
  const expiryEnd = new Date(year, month, 0, 23, 59, 59)
  return expiryEnd.getTime() < Date.now()
}

type Errors = Partial<
  Record<
    | 'method'
    | 'cardName'
    | 'cardNumber'
    | 'cardExpiry'
    | 'cardCvv'
    | 'mobilePhone'
    | 'cart'
    | 'contact',
    string
  >
>

function FieldError({ children }: { children: React.ReactNode }) {
  return (
    <p className="mt-1.5 text-xs text-red-600 inline-flex items-center gap-1">
      <AlertCircle size={12} />
      {children}
    </p>
  )
}

export default function CheckoutPage() {
  const router = useRouter()
  const { items, subtotal, clear } = useCart()

  const [selected, setSelected] = useState<PaymentMethodId>('mpesa-default')
  const [newKind, setNewKind] = useState<'card' | 'mobile'>('card')

  const [cardName, setCardName] = useState('')
  const [cardNumber, setCardNumber] = useState('')
  const [cardExpiry, setCardExpiry] = useState('')
  const [cardCvv, setCardCvv] = useState('')

  const [mobileProvider, setMobileProvider] = useState('M-Pesa')
  const [mobilePhone, setMobilePhone] = useState('')

  const [errors, setErrors] = useState<Errors>({})
  const [submitting, setSubmitting] = useState(false)
  const [contact, setContactState] = useState<StoredContact | null>(null)

  useEffect(() => {
    setContactState(getContact())
  }, [])

  const vat = useMemo(() => Math.round(subtotal * 0.18), [subtotal])
  const total = subtotal + vat

  const clearError = (key: keyof Errors) =>
    setErrors((prev) => {
      if (!prev[key]) return prev
      const next = { ...prev }
      delete next[key]
      return next
    })

  const paymentLabel = (): string => {
    if (selected === 'new-card') return `Card ending in ${cardNumber.replace(/\s/g, '').slice(-4)}`
    if (selected === 'new-mobile') return `${mobileProvider} ${mobilePhone.trim()}`
    return SAVED_METHODS.find((m) => m.id === selected)?.label ?? 'Saved method'
  }

  const validate = (): Errors => {
    const e: Errors = {}
    if (items.length === 0) e.cart = 'Your cart is empty — add a design before paying.'
    if (!contact) e.contact = 'Please add your contact details before paying.'
    if (selected === 'new-card') {
      if (!cardName.trim()) e.cardName = 'Name on card is required.'
      if (!CARD_NUMBER_RE.test(cardNumber.replace(/\s/g, '')))
        e.cardNumber = 'Enter a 13–19 digit card number.'
      if (!EXPIRY_RE.test(cardExpiry)) e.cardExpiry = 'Use MM/YY format.'
      else if (isExpiryInPast(cardExpiry)) e.cardExpiry = 'This card has expired.'
      if (!CVV_RE.test(cardCvv)) e.cardCvv = '3 or 4 digits.'
    } else if (selected === 'new-mobile') {
      if (!PHONE_RE.test(mobilePhone.trim())) e.mobilePhone = 'Enter a valid phone number.'
    }
    return e
  }

  const handlePay = () => {
    const e = validate()
    setErrors(e)
    if (Object.keys(e).length > 0) return
    if (!contact) return
    setSubmitting(true)
    try {
      const ref = generateOrderRef()
      setLastOrder({
        ref,
        paidAt: new Date().toISOString(),
        items: items.map((i) => ({ id: i.id, name: i.name, summary: i.summary, total: i.total })),
        subtotal,
        vat,
        total,
      })
      clear()
      router.push('/invitations/confirmation')
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <>
      <main className="bg-gray-50 min-h-screen py-8">
        <div className="max-w-7xl mx-auto px-4 lg:px-8">
          <Link
            href="/invitations/address"
            className="inline-flex items-center text-sm font-medium text-gray-700 hover:text-gray-900 mb-4"
          >
            ← Back to contact details
          </Link>
          <CheckoutStepper current="payment" />

          <div className="grid grid-cols-1 lg:grid-cols-[1fr_360px] gap-6 lg:gap-8">
            {/* LEFT — Payment */}
            <section className="bg-white rounded-2xl border border-gray-200 p-6 md:p-8">
              <h1 className="text-2xl font-bold text-gray-900 mb-6">Payment</h1>

              {(errors.cart || errors.contact) && (
                <div className="mb-6 rounded-md border border-red-300 bg-red-50 p-4 text-sm text-red-800">
                  <p className="font-semibold mb-1 inline-flex items-center gap-1.5">
                    <AlertCircle size={14} /> We can&apos;t process this yet
                  </p>
                  <ul className="list-disc pl-5 space-y-0.5">
                    {errors.cart && <li>{errors.cart}</li>}
                    {errors.contact && (
                      <li>
                        {errors.contact}{' '}
                        <Link href="/invitations/address" className="underline font-medium">
                          Add one →
                        </Link>
                      </li>
                    )}
                  </ul>
                </div>
              )}

              {contact && (
                <div className="mb-6 rounded-xl border border-gray-200 bg-gray-50 p-4 text-sm">
                  <p className="font-semibold text-gray-900 mb-1">Delivering to</p>
                  <p className="text-gray-700">{contact.fullName}</p>
                  <div className="flex flex-wrap gap-4 mt-1 text-gray-500 text-xs">
                    <span className="inline-flex items-center gap-1"><Mail size={12} />{contact.email}</span>
                    <span className="inline-flex items-center gap-1"><Smartphone size={12} />{contact.phone}</span>
                  </div>
                  <Link href="/invitations/address" className="mt-2 inline-block text-xs font-medium text-gray-700 underline underline-offset-4 hover:text-gray-900">
                    Edit
                  </Link>
                </div>
              )}

              {/* Saved methods */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-6">
                {SAVED_METHODS.map((m) => {
                  const isActive = selected === m.id
                  return (
                    <button
                      key={m.id}
                      type="button"
                      onClick={() => setSelected(m.id)}
                      aria-pressed={isActive}
                      className={`relative text-left rounded-xl border-2 p-4 transition-colors ${
                        isActive ? 'border-gray-900 bg-white' : 'border-gray-200 bg-white hover:border-gray-400'
                      }`}
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

              <div className="flex items-center gap-4 mb-6">
                <div className="flex-1 h-px bg-gray-200" />
                <span className="text-sm text-gray-500">or</span>
                <div className="flex-1 h-px bg-gray-200" />
              </div>

              <div className="mb-5">
                <h2 className="text-base font-semibold text-gray-900 mb-3">Add a new payment method</h2>
                <div className="inline-flex rounded-full border border-gray-200 bg-gray-50 p-1 mb-5">
                  <button
                    type="button"
                    onClick={() => { setNewKind('card'); setSelected('new-card') }}
                    className={`inline-flex items-center gap-1.5 px-4 py-1.5 rounded-full text-sm font-semibold transition-colors ${
                      newKind === 'card' ? 'bg-white text-gray-900 shadow-sm' : 'text-gray-600 hover:text-gray-900'
                    }`}
                  >
                    <CreditCard size={14} />
                    Card
                  </button>
                  <button
                    type="button"
                    onClick={() => { setNewKind('mobile'); setSelected('new-mobile') }}
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
                        onChange={(e) => { setCardName(e.target.value); clearError('cardName') }}
                        onFocus={() => setSelected('new-card')}
                        placeholder="Mary Mwakasege"
                        aria-invalid={Boolean(errors.cardName)}
                        className={`w-full h-11 rounded-md border px-3 text-sm focus:outline-none ${
                          errors.cardName ? 'border-red-500 focus:border-red-600' : 'border-gray-300 focus:border-gray-500'
                        }`}
                      />
                      {errors.cardName && <FieldError>{errors.cardName}</FieldError>}
                    </div>
                    <div className="sm:col-span-1">
                      <label className="block text-sm font-medium text-gray-900 mb-1.5">
                        Card number <span className="text-red-600">*</span>
                      </label>
                      <input
                        type="text"
                        value={cardNumber}
                        onChange={(e) => { setCardNumber(e.target.value); clearError('cardNumber') }}
                        onFocus={() => setSelected('new-card')}
                        placeholder="xxxx xxxx xxxx xxxx"
                        inputMode="numeric"
                        aria-invalid={Boolean(errors.cardNumber)}
                        className={`w-full h-11 rounded-md border px-3 text-sm focus:outline-none ${
                          errors.cardNumber ? 'border-red-500 focus:border-red-600' : 'border-gray-300 focus:border-gray-500'
                        }`}
                      />
                      {errors.cardNumber && <FieldError>{errors.cardNumber}</FieldError>}
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-900 mb-1.5">
                        Card expiration <span className="text-red-600">*</span>
                      </label>
                      <input
                        type="text"
                        value={cardExpiry}
                        onChange={(e) => { setCardExpiry(e.target.value); clearError('cardExpiry') }}
                        onFocus={() => setSelected('new-card')}
                        placeholder="MM/YY"
                        inputMode="numeric"
                        aria-invalid={Boolean(errors.cardExpiry)}
                        className={`w-full h-11 rounded-md border px-3 text-sm focus:outline-none ${
                          errors.cardExpiry ? 'border-red-500 focus:border-red-600' : 'border-gray-300 focus:border-gray-500'
                        }`}
                      />
                      {errors.cardExpiry && <FieldError>{errors.cardExpiry}</FieldError>}
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-900 mb-1.5">
                        CVV <span className="text-red-600">*</span>
                      </label>
                      <input
                        type="text"
                        value={cardCvv}
                        onChange={(e) => { setCardCvv(e.target.value); clearError('cardCvv') }}
                        onFocus={() => setSelected('new-card')}
                        placeholder="123"
                        inputMode="numeric"
                        maxLength={4}
                        aria-invalid={Boolean(errors.cardCvv)}
                        className={`w-full h-11 rounded-md border px-3 text-sm focus:outline-none ${
                          errors.cardCvv ? 'border-red-500 focus:border-red-600' : 'border-gray-300 focus:border-gray-500'
                        }`}
                      />
                      {errors.cardCvv && <FieldError>{errors.cardCvv}</FieldError>}
                    </div>
                  </div>
                ) : (
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-4 gap-y-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-900 mb-1.5">
                        Provider <span className="text-red-600">*</span>
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
                        onChange={(e) => { setMobilePhone(e.target.value); clearError('mobilePhone') }}
                        onFocus={() => setSelected('new-mobile')}
                        placeholder="+255 7xx xxx xxx"
                        inputMode="tel"
                        aria-invalid={Boolean(errors.mobilePhone)}
                        className={`w-full h-11 rounded-md border px-3 text-sm focus:outline-none ${
                          errors.mobilePhone ? 'border-red-500 focus:border-red-600' : 'border-gray-300 focus:border-gray-500'
                        }`}
                      />
                      {errors.mobilePhone && <FieldError>{errors.mobilePhone}</FieldError>}
                    </div>
                    <p className="sm:col-span-2 text-xs text-gray-500 mt-1">
                      You&apos;ll get a prompt on your phone to approve the payment.
                    </p>
                  </div>
                )}
              </div>

              <button
                type="button"
                onClick={handlePay}
                disabled={submitting || items.length === 0}
                className="w-full h-12 bg-gray-900 text-white font-semibold rounded-md hover:bg-gray-800 transition mt-2 disabled:bg-gray-300 disabled:cursor-not-allowed"
              >
                {submitting ? 'Processing…' : `Pay ${formatTzs(total)}`}
              </button>

              <p className="mt-4 text-xs text-gray-500 inline-flex items-center gap-1.5">
                <ShieldCheck size={13} className="text-emerald-600" />
                Payments are processed securely. Your design goes live within 24 hours of confirmation.
              </p>
            </section>

            <aside className="space-y-5">
              <div className="rounded-2xl bg-white border border-gray-200 p-5">
                <h2 className="text-base font-bold text-gray-900 mb-4">Order summary</h2>
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
                <div className="flex justify-between items-baseline">
                  <span className="text-base font-bold text-gray-900">Total</span>
                  <span className="text-xl font-bold text-gray-900">{formatTzs(total)}</span>
                </div>
              </div>

              <p className="text-center text-xs text-gray-500">
                Payments processed securely by{' '}
                <span className="font-medium text-gray-900">OpusFesta Pay</span>
              </p>
            </aside>
          </div>
        </div>
      </main>
    </>
  )
}
