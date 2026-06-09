'use client'

import { useEffect, useState } from 'react'
import Image from 'next/image'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { Smartphone, ShieldCheck, AlertCircle, Mail, Clock, Sparkles, MapPin, Pencil, Copy, Check } from 'lucide-react'
import CheckoutStepper from '@/components/invitations/CheckoutStepper'
import { useCart } from '@/components/providers/CartProvider'
import {
  getContact,
  generateOrderRef,
  setLastOrder,
  type StoredContact,
} from '@/lib/cart-storage'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Separator } from '@/components/ui/separator'
import { cn } from '@/lib/utils'

type Logo = { src: string; w: number; h: number; cls: string }
type PaymentMethod = {
  id: string
  kind: 'mobile' | 'card'
  provider: string
  desc: string
  logos: Logo[]
}

const PAYMENT_METHODS: PaymentMethod[] = [
  {
    id: 'mpesa',
    kind: 'mobile',
    provider: 'M-Pesa',
    desc: 'Approve the prompt on your phone',
    logos: [{ src: '/assets/payment-logos/m-pesa-logo.png', w: 600, h: 400, cls: 'h-6 w-auto' }],
  },
  {
    id: 'airtel',
    kind: 'mobile',
    provider: 'Airtel Money',
    desc: 'Approve the prompt on your phone',
    logos: [{ src: '/assets/payment-logos/airtel-money.png', w: 390, h: 230, cls: 'h-5 w-auto' }],
  },
  {
    id: 'mixx',
    kind: 'mobile',
    provider: 'Mixx by Yas',
    desc: 'Mixx by Yas (Tigo Pesa)',
    logos: [{ src: '/assets/payment-logos/mixx-by-yass-tigo-pesa.png', w: 600, h: 400, cls: 'h-6 w-auto' }],
  },
  {
    id: 'card',
    kind: 'card',
    provider: 'Card',
    desc: 'Visa or Mastercard',
    logos: [
      { src: '/assets/payment-logos/visa.svg', w: 1000, h: 325, cls: 'h-4 w-auto' },
      { src: '/assets/payment-logos/mastercard.svg', w: 1000, h: 618, cls: 'h-6 w-auto' },
    ],
  },
]

// OpusFesta's M-Pesa Lipa Namba (Buy Goods / till number).
// TODO: replace the placeholder with the real business number.
const MPESA_LIPA_NAMBA = '000000'
const MPESA_LIPA_NAME = 'OpusFesta'

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
    'cardName' | 'cardNumber' | 'cardExpiry' | 'cardCvv' | 'mobilePhone' | 'cart' | 'contact',
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

// Small copy-to-clipboard control with a brief "copied" confirmation.
function CopyButton({ value, label }: { value: string; label: string }) {
  const [copied, setCopied] = useState(false)
  return (
    <button
      type="button"
      onClick={() => {
        void navigator.clipboard?.writeText(value)
        setCopied(true)
        setTimeout(() => setCopied(false), 1500)
      }}
      aria-label={copied ? `${label} copied` : `Copy ${label}`}
      className="inline-flex size-7 shrink-0 items-center justify-center rounded-md border border-gray-200 bg-white text-gray-500 transition hover:border-gray-300 hover:text-gray-900"
    >
      {copied ? <Check size={14} className="text-emerald-600" /> : <Copy size={14} />}
    </button>
  )
}

export default function CheckoutPage() {
  const router = useRouter()
  const { items, subtotal, clear } = useCart()

  const [selected, setSelected] = useState<string>('mpesa')
  // M-Pesa supports two flows: STK push to phone, or pay to our Lipa Namba.
  const [mpesaMode, setMpesaMode] = useState<'phone' | 'lipa'>('phone')

  const [cardName, setCardName] = useState('')
  const [cardNumber, setCardNumber] = useState('')
  const [cardExpiry, setCardExpiry] = useState('')
  const [cardCvv, setCardCvv] = useState('')
  const [mobilePhone, setMobilePhone] = useState('')

  const [errors, setErrors] = useState<Errors>({})
  const [submitting, setSubmitting] = useState(false)
  const [contact, setContactState] = useState<StoredContact | null>(null)

  useEffect(() => {
    setContactState(getContact())
  }, [])

  const method = PAYMENT_METHODS.find((m) => m.id === selected) ?? PAYMENT_METHODS[0]
  const isCard = method.kind === 'card'
  const isMpesa = method.id === 'mpesa'
  const useLipa = isMpesa && mpesaMode === 'lipa'

  // Digital product — prices are final (VAT-inclusive) and delivery is free.
  const discount = 0
  const total = subtotal - discount

  const clearError = (key: keyof Errors) =>
    setErrors((prev) => {
      if (!prev[key]) return prev
      const next = { ...prev }
      delete next[key]
      return next
    })

  const paymentLabel = (): string => {
    if (isCard) return `Card ending in ${cardNumber.replace(/\s/g, '').slice(-4)}`
    if (useLipa) return `M-Pesa Lipa Namba ${MPESA_LIPA_NAMBA} · ${mobilePhone.trim()}`
    return `${method.provider} ${mobilePhone.trim()}`
  }

  const validate = (): Errors => {
    const e: Errors = {}
    if (items.length === 0) e.cart = 'Your cart is empty — add a design before paying.'
    if (!contact) e.contact = 'Please add your contact details before paying.'
    if (isCard) {
      if (!cardName.trim()) e.cardName = 'Name on card is required.'
      if (!CARD_NUMBER_RE.test(cardNumber.replace(/\s/g, '')))
        e.cardNumber = 'Enter a 13–19 digit card number.'
      if (!EXPIRY_RE.test(cardExpiry)) e.cardExpiry = 'Use MM/YY format.'
      else if (isExpiryInPast(cardExpiry)) e.cardExpiry = 'This card has expired.'
      if (!CVV_RE.test(cardCvv)) e.cardCvv = '3 or 4 digits.'
    } else if (!PHONE_RE.test(mobilePhone.trim())) {
      e.mobilePhone = 'Enter a valid phone number.'
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
        paymentLabel: paymentLabel(),
        contact: { name: contact.fullName, email: contact.email, phone: contact.phone },
        items: items.map((i) => ({
          id: i.id,
          name: i.name,
          summary: i.summary,
          total: i.total,
          treatment: i.treatment,
          tier: i.tier,
          tierId: i.tierId,
          guests: i.guests,
          addOns: i.addOns,
        })),
        subtotal,
        discount,
        total,
      })
      clear()
      router.push('/invitations/confirmation')
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <main className="bg-gray-50 min-h-screen py-8">
      <div className="max-w-7xl mx-auto px-4 lg:px-8">
        <Link
          href="/invitations/address"
          className="inline-flex items-center text-sm font-medium text-gray-700 hover:text-gray-900 mb-4"
        >
          ← Back to contact details
        </Link>
        <CheckoutStepper current="payment" />

        <div className="mt-4 grid grid-cols-1 lg:grid-cols-[1fr_360px] gap-6 lg:gap-8">
          {/* LEFT — Payment */}
          <Card className="border-0 shadow-[0_2px_12px_-6px_rgba(0,0,0,0.12)]">
            <CardHeader>
              <CardTitle className="text-2xl font-semibold">Payment</CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              {(errors.cart || errors.contact) && (
                <div className="rounded-md border border-red-300 bg-red-50 p-4 text-sm text-red-800">
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
                <div className="flex items-start gap-3.5 rounded-xl border border-gray-200 bg-white p-4 text-sm shadow-[0_1px_2px_rgba(0,0,0,0.04)]">
                  <span className="flex size-9 shrink-0 items-center justify-center rounded-full bg-gray-100 text-gray-900">
                    <MapPin size={17} />
                  </span>
                  <div className="min-w-0 grow">
                    <p className="text-[11px] font-semibold uppercase tracking-[0.08em] text-muted-foreground">
                      Delivering to
                    </p>
                    <p className="mt-0.5 font-semibold text-gray-900">{contact.fullName}</p>
                    <div className="mt-1.5 flex flex-wrap gap-x-4 gap-y-1 text-xs text-gray-500">
                      <span className="inline-flex items-center gap-1.5"><Mail size={12} className="shrink-0" />{contact.email}</span>
                      <span className="inline-flex items-center gap-1.5"><Smartphone size={12} className="shrink-0" />{contact.phone}</span>
                    </div>
                  </div>
                  <Link
                    href="/invitations/address"
                    className="inline-flex shrink-0 items-center gap-1.5 rounded-full border border-gray-200 px-3 py-1.5 text-xs font-semibold text-gray-700 transition hover:border-gray-300 hover:bg-gray-50 hover:text-gray-900"
                  >
                    <Pencil size={12} />
                    Edit
                  </Link>
                </div>
              )}

              {/* Payment method picker — selection style matches the product
                  page's optional add-ons (square check, dark when selected). */}
              <div className="space-y-3">
                <h2 className="text-base font-semibold text-gray-900">Choose how to pay</h2>
                <div role="radiogroup" aria-label="Payment method" className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                  {PAYMENT_METHODS.map((m) => {
                    const checked = selected === m.id
                    return (
                      <label
                        key={m.id}
                        className={cn(
                          'flex cursor-pointer flex-col gap-3 rounded-md border p-4 transition',
                          checked ? 'border-[#1A1A1A] bg-white' : 'border-gray-200 bg-white hover:border-gray-300',
                        )}
                      >
                        <div className="flex items-start gap-3">
                          <input
                            type="radio"
                            name="payment-method"
                            value={m.id}
                            checked={checked}
                            onChange={() => setSelected(m.id)}
                            aria-describedby={`pm-${m.id}-desc`}
                            className="peer sr-only"
                          />
                          <span
                            aria-hidden
                            className={cn(
                              'mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-md border transition peer-focus-visible:ring-2 peer-focus-visible:ring-[#1A1A1A]/25',
                              checked ? 'border-[#1A1A1A] bg-[#1A1A1A] text-white' : 'border-gray-300 bg-white text-transparent',
                            )}
                          >
                            <Check size={13} strokeWidth={3} />
                          </span>
                          <div className="grow">
                            <p className="text-[14px] font-bold text-gray-900">{m.provider}</p>
                            <p id={`pm-${m.id}-desc`} className="mt-1 text-[12px] leading-relaxed text-gray-600">
                              {m.desc}
                            </p>
                          </div>
                        </div>
                        <div className="ml-8 flex items-center gap-2">
                          {m.logos.map((logo) => (
                            <span
                              key={logo.src}
                              className="inline-flex h-7 items-center justify-center rounded-md border border-gray-200 bg-white px-1.5"
                            >
                              <Image src={logo.src} alt="" width={logo.w} height={logo.h} className={logo.cls} />
                            </span>
                          ))}
                        </div>
                      </label>
                    )
                  })}
                </div>
              </div>

              {/* Method-specific details */}
              {isCard ? (
                <div className="grid grid-cols-1 gap-x-4 gap-y-4 sm:grid-cols-2">
                  <div className="sm:col-span-2">
                    <Label htmlFor="card-name" className="mb-1.5 text-gray-900">
                      Full name (as on card) <span className="text-red-600">*</span>
                    </Label>
                    <Input
                      id="card-name"
                      type="text"
                      value={cardName}
                      onChange={(e) => { setCardName(e.target.value); clearError('cardName') }}
                      placeholder="Mary Mwakasege"
                      aria-invalid={Boolean(errors.cardName)}
                    />
                    {errors.cardName && <FieldError>{errors.cardName}</FieldError>}
                  </div>
                  <div className="sm:col-span-2">
                    <Label htmlFor="card-number" className="mb-1.5 text-gray-900">
                      Card number <span className="text-red-600">*</span>
                    </Label>
                    <Input
                      id="card-number"
                      type="text"
                      value={cardNumber}
                      onChange={(e) => { setCardNumber(e.target.value); clearError('cardNumber') }}
                      placeholder="xxxx xxxx xxxx xxxx"
                      inputMode="numeric"
                      aria-invalid={Boolean(errors.cardNumber)}
                    />
                    {errors.cardNumber && <FieldError>{errors.cardNumber}</FieldError>}
                  </div>
                  <div>
                    <Label htmlFor="card-expiry" className="mb-1.5 text-gray-900">
                      Card expiration <span className="text-red-600">*</span>
                    </Label>
                    <Input
                      id="card-expiry"
                      type="text"
                      value={cardExpiry}
                      onChange={(e) => { setCardExpiry(e.target.value); clearError('cardExpiry') }}
                      placeholder="MM/YY"
                      inputMode="numeric"
                      aria-invalid={Boolean(errors.cardExpiry)}
                    />
                    {errors.cardExpiry && <FieldError>{errors.cardExpiry}</FieldError>}
                  </div>
                  <div>
                    <Label htmlFor="card-cvv" className="mb-1.5 text-gray-900">
                      CVV <span className="text-red-600">*</span>
                    </Label>
                    <Input
                      id="card-cvv"
                      type="text"
                      value={cardCvv}
                      onChange={(e) => { setCardCvv(e.target.value); clearError('cardCvv') }}
                      placeholder="123"
                      inputMode="numeric"
                      maxLength={4}
                      aria-invalid={Boolean(errors.cardCvv)}
                    />
                    {errors.cardCvv && <FieldError>{errors.cardCvv}</FieldError>}
                  </div>
                </div>
              ) : (
                <div className="space-y-4">
                  {/* M-Pesa offers two flows: STK push, or pay to our Lipa Namba */}
                  {isMpesa && (
                    <div className="inline-flex rounded-full border border-gray-200 bg-gray-50 p-1">
                      <button
                        type="button"
                        onClick={() => setMpesaMode('phone')}
                        className={cn(
                          'rounded-full px-4 py-1.5 text-sm font-semibold transition-colors',
                          mpesaMode === 'phone' ? 'bg-white text-gray-900 shadow-sm' : 'text-gray-600 hover:text-gray-900',
                        )}
                      >
                        Phone prompt
                      </button>
                      <button
                        type="button"
                        onClick={() => setMpesaMode('lipa')}
                        className={cn(
                          'rounded-full px-4 py-1.5 text-sm font-semibold transition-colors',
                          mpesaMode === 'lipa' ? 'bg-white text-gray-900 shadow-sm' : 'text-gray-600 hover:text-gray-900',
                        )}
                      >
                        Lipa Namba
                      </button>
                    </div>
                  )}

                  {useLipa && (
                    <div className="overflow-hidden rounded-xl border border-gray-200">
                      {/* Lipa Namba + amount, both copyable */}
                      <div className="grid grid-cols-2 divide-x divide-gray-200 border-b border-gray-200 bg-gray-50">
                        <div className="p-4">
                          <p className="text-[11px] font-semibold uppercase tracking-[0.08em] text-gray-500">
                            Lipa Namba
                          </p>
                          <div className="mt-1.5 flex items-center gap-2">
                            <span className="text-2xl font-bold tracking-wide text-gray-900 tabular-nums">
                              {MPESA_LIPA_NAMBA}
                            </span>
                            <CopyButton value={MPESA_LIPA_NAMBA} label="Lipa Namba" />
                          </div>
                          <p className="mt-0.5 text-xs text-gray-500">{MPESA_LIPA_NAME}</p>
                        </div>
                        <div className="p-4">
                          <p className="text-[11px] font-semibold uppercase tracking-[0.08em] text-gray-500">
                            Amount
                          </p>
                          <div className="mt-1.5 flex items-center gap-2">
                            <span className="text-2xl font-bold text-gray-900 tabular-nums">
                              {formatTzs(total)}
                            </span>
                            <CopyButton value={String(total)} label="amount" />
                          </div>
                        </div>
                      </div>
                      {/* Step-by-step */}
                      <ol className="space-y-3 p-4">
                        {[
                          'Open the M-Pesa menu → Lipa kwa M-Pesa → Lipa Namba',
                          'Enter the Lipa Namba and amount shown above',
                          'Confirm with your PIN, then tap Pay below',
                        ].map((step, i) => (
                          <li key={i} className="flex items-start gap-3">
                            <span className="flex size-5 shrink-0 items-center justify-center rounded-full bg-gray-900 text-[11px] font-bold text-white tabular-nums">
                              {i + 1}
                            </span>
                            <p className="text-xs leading-relaxed text-gray-700">{step}</p>
                          </li>
                        ))}
                      </ol>
                    </div>
                  )}

                  <div>
                    <Label htmlFor="mobile-phone" className="mb-1.5 text-gray-900">
                      {useLipa ? 'Your M-Pesa number (for confirmation)' : `${method.provider} phone number`}{' '}
                      <span className="text-red-600">*</span>
                    </Label>
                    <Input
                      id="mobile-phone"
                      type="tel"
                      value={mobilePhone}
                      onChange={(e) => { setMobilePhone(e.target.value); clearError('mobilePhone') }}
                      placeholder="+255 7xx xxx xxx"
                      inputMode="tel"
                      aria-invalid={Boolean(errors.mobilePhone)}
                    />
                    {errors.mobilePhone && <FieldError>{errors.mobilePhone}</FieldError>}
                    {!useLipa && (
                      <p className="mt-1.5 text-xs text-gray-500">
                        You&apos;ll get a prompt on your phone to approve the payment.
                      </p>
                    )}
                  </div>
                </div>
              )}

              <button
                type="button"
                onClick={handlePay}
                disabled={submitting || items.length === 0}
                className="inline-flex w-full items-center justify-center rounded-full bg-(--accent) px-6 py-3.5 text-[13px] font-extrabold uppercase tracking-[0.06em] text-(--on-accent) transition hover:bg-(--accent-hover) disabled:cursor-not-allowed disabled:bg-gray-300 disabled:text-gray-500"
              >
                {submitting ? 'Processing…' : `Pay ${formatTzs(total)}`}
              </button>

              <p className="text-xs text-gray-500 inline-flex items-center gap-1.5">
                <ShieldCheck size={13} className="text-emerald-600" />
                Payments are processed securely. Your design goes live within 24 hours of confirmation.
              </p>
            </CardContent>
          </Card>

          {/* RIGHT — Order summary & info */}
          <aside className="flex flex-col gap-5">
            <Card className="border-0 shadow-[0_2px_12px_-6px_rgba(0,0,0,0.12)]">
              <CardHeader>
                <CardTitle className="text-xl font-semibold">Order summary</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center justify-between text-sm">
                  <span className="text-muted-foreground">Price</span>
                  <span className="font-medium text-gray-900 tabular-nums">{formatTzs(subtotal)}</span>
                </div>
                {discount > 0 && (
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-muted-foreground">Discount</span>
                    <span className="font-medium text-green-600 tabular-nums">-{formatTzs(discount)}</span>
                  </div>
                )}
                <div className="flex items-center justify-between text-sm">
                  <span className="text-muted-foreground">Delivery charges</span>
                  <span className="font-semibold text-gray-900">Free delivery</span>
                </div>
                <Separator />
                <div className="flex items-center justify-between">
                  <span className="text-base font-semibold text-gray-900">Total</span>
                  <span className="text-xl font-semibold text-gray-900 tabular-nums">{formatTzs(total)}</span>
                </div>
              </CardContent>
            </Card>

            <div className="flex gap-2.5 rounded-lg bg-white border border-gray-200 px-3 py-3">
              <Clock className="mt-0.5 size-5 shrink-0 text-gray-700" />
              <div className="space-y-0.5">
                <h5 className="text-sm font-semibold text-gray-900">Ready in 24 hours</h5>
                <p className="text-xs text-gray-600">
                  Your personalised design and OpusPass tickets are delivered within a day of payment.
                </p>
              </div>
            </div>

            <div className="flex gap-2.5 rounded-lg bg-white border border-gray-200 px-3 py-3">
              <Sparkles className="mt-0.5 size-5 shrink-0 text-gray-700" />
              <div className="space-y-0.5">
                <h5 className="text-sm font-semibold text-gray-900">One free revision</h5>
                <p className="text-xs text-gray-600">
                  We&apos;ll fine-tune the details until your invitation looks just right.
                </p>
              </div>
            </div>

            <p className="text-center text-xs text-gray-500">
              Your payment details are encrypted and processed securely.
            </p>
          </aside>
        </div>
      </div>
    </main>
  )
}
