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
  type StoredOrderPayment,
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
    desc: 'Lipa Namba or QR — pay from any network or bank',
    logos: [{ src: '/assets/payment-logos/m-pesa-logo.png', w: 600, h: 400, cls: 'h-6 w-auto' }],
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

// OpusFesta's M-Pesa Lipa Namba (TIPS / Tan QR merchant number) — from the
// official Vodacom "Pesa ni M-Pesa" merchant poster.
const MPESA_LIPA_NAMBA = '350298654'
const MPESA_LIPA_NAME = 'OPUSFESTA COMPANY LIMITED'
const MPESA_LIPA_POSTER_SRC = '/assets/payment/opusfesta-mpesa-lipa-poster.png'

// Payment steps per network, transcribed from the merchant poster
// ("Jinsi ya kufanya malipo kwa Tan QR Code"). The USSD menus are in
// Swahili on every Tanzanian handset, so the steps stay in Swahili.
type LipaStep = { do: string; detail: string }
type LipaNetwork = { id: string; name: string; dial: string; steps: LipaStep[] }

const LIPA_NETWORKS: LipaNetwork[] = [
  {
    id: 'vodacom',
    name: 'Vodacom M-Pesa',
    dial: '*150*00#',
    steps: [
      { do: 'Chagua 4', detail: 'LIPA kwa M-Pesa' },
      { do: 'Chagua 1', detail: 'LIPA kwa Simu' },
      { do: 'Weka Lipa Namba', detail: MPESA_LIPA_NAMBA },
      { do: 'Weka kiasi', detail: 'cha kulipa' },
      { do: 'Weka namba ya siri', detail: 'kuthibitisha malipo' },
    ],
  },
  {
    id: 'tigo',
    name: 'Tigo Pesa (Mixx by Yas)',
    dial: '*150*01#',
    steps: [
      { do: 'Chagua 5', detail: 'LIPA KWA SIMU' },
      { do: 'Chagua 3', detail: 'Kwenda Mitandao mingine' },
      { do: 'Chagua 1', detail: 'M-Pesa' },
      { do: 'Weka M-Pesa Lipa Namba', detail: MPESA_LIPA_NAMBA },
      { do: 'Weka kiasi', detail: 'unacholipa' },
      { do: 'Weka namba ya Siri', detail: 'kuthibitisha' },
    ],
  },
  {
    id: 'airtel',
    name: 'Airtel Money',
    dial: '*150*60#',
    steps: [
      { do: 'Chagua 5', detail: 'Lipia Bili' },
      { do: 'Chagua 1', detail: 'Lipa kwa simu (Mitandao yote)' },
      { do: 'Chagua 2', detail: 'Lipa kwa Voda Lipa' },
      { do: 'Ingiza kiasi', detail: 'cha pesa' },
      { do: 'Ingiza namba ya kumbukumbu', detail: MPESA_LIPA_NAMBA },
      { do: 'Weka namba ya Siri', detail: 'kuthibitisha' },
    ],
  },
  {
    id: 'other',
    name: 'Mitandao mingine & benki',
    dial: 'Menyu ya huduma za kifedha ya mtandao wako',
    steps: [
      { do: 'Chagua', detail: 'LIPA KWA SIMU' },
      { do: 'Chagua', detail: 'Kwenda Mitandao Mingine' },
      { do: 'Chagua', detail: 'M-Pesa' },
      { do: 'Ingiza namba ya Mfanyabiashara', detail: MPESA_LIPA_NAMBA },
      { do: 'Ingiza kiasi', detail: 'cha kulipa' },
      { do: 'Ingiza namba ya siri', detail: 'kuthibitisha' },
    ],
  },
]

function formatTzs(n: number): string {
  return `TZS ${n.toLocaleString('en-US')}`
}

const PHONE_RE = /^\+?(?:[\d](?:[\s().-]?)){9,}$/
// Transaction confirmation codes vary per network (M-Pesa: 10 alphanumeric,
// Tigo/Airtel: digits, banks may include dots/dashes) — keep it lenient.
const PAYREF_RE = /^[A-Za-z0-9.\-]{6,25}$/
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
    'cardName' | 'cardNumber' | 'cardExpiry' | 'cardCvv' | 'mobilePhone' | 'payerName' | 'payRef' | 'cart' | 'contact',
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
  const [lipaNetwork, setLipaNetwork] = useState<string>('vodacom')

  const [cardName, setCardName] = useState('')
  const [cardNumber, setCardNumber] = useState('')
  const [cardExpiry, setCardExpiry] = useState('')
  const [cardCvv, setCardCvv] = useState('')
  const [mobilePhone, setMobilePhone] = useState('')
  const [payerName, setPayerName] = useState('')
  const [payRef, setPayRef] = useState('')

  const [errors, setErrors] = useState<Errors>({})
  const [submitting, setSubmitting] = useState(false)
  const [contact, setContactState] = useState<StoredContact | null>(null)

  useEffect(() => {
    queueMicrotask(() => setContactState(getContact()))
  }, [])

  const method = PAYMENT_METHODS.find((m) => m.id === selected) ?? PAYMENT_METHODS[0]
  const isCard = method.kind === 'card'
  const isMpesa = method.id === 'mpesa'
  // M-Pesa is paid to our Lipa Namba — how it's done in Tanzania,
  // works from every network and bank.
  const useLipa = isMpesa

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
    if (useLipa)
      return `M-Pesa Lipa Namba ${MPESA_LIPA_NAMBA} · ${payerName.trim()} · ${mobilePhone.trim()} · Ref ${payRef.trim().toUpperCase()}`
    return `${method.provider} ${mobilePhone.trim()}`
  }

  const paymentDetails = (): StoredOrderPayment => {
    if (isCard) return { provider: 'Card', cardLast4: cardNumber.replace(/\s/g, '').slice(-4) }
    if (useLipa)
      return {
        provider: 'M-Pesa',
        businessNumber: MPESA_LIPA_NAMBA,
        payerPhone: mobilePhone.trim(),
        payerName: payerName.trim(),
        reference: payRef.trim().toUpperCase(),
      }
    return { provider: method.provider, payerPhone: mobilePhone.trim() }
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
    } else {
      if (!PHONE_RE.test(mobilePhone.trim())) {
        e.mobilePhone = 'Enter a valid phone number.'
      }
      if (useLipa && payerName.trim().length < 3) {
        e.payerName = 'Enter the name on the account the payment came from.'
      }
      if (useLipa && !PAYREF_RE.test(payRef.trim())) {
        e.payRef = 'Enter the confirmation code from your payment SMS (6–25 letters or numbers).'
      }
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
        payment: paymentDetails(),
        paymentRef: useLipa ? payRef.trim().toUpperCase() : undefined,
        // Lipa Namba payments are only considered paid once the OpusFesta
        // team confirms the transaction against the M-Pesa statement.
        paymentStatus: useLipa ? 'verifying' : 'paid',
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
                  {useLipa && (
                    <div className="overflow-hidden rounded-2xl border border-gray-200">
                      <div className="flex justify-center bg-white p-3 sm:p-4">
                        <Image
                          src={MPESA_LIPA_POSTER_SRC}
                          alt={`M-Pesa Lipa Namba poster for ${MPESA_LIPA_NAME}`}
                          width={1749}
                          height={2481}
                          quality={100}
                          sizes="(min-width: 1024px) 360px, (min-width: 640px) 420px, 82vw"
                          className="h-auto max-h-[420px] w-auto max-w-full object-contain sm:max-h-[500px] lg:max-h-[560px]"
                        />
                      </div>

                      {/* Amount to send */}
                      <div className="flex items-center justify-between gap-3 border-b border-gray-200 bg-gray-50 px-4 py-3">
                        <p className="text-[11px] font-semibold uppercase tracking-[0.08em] text-gray-500">
                          Amount to send
                        </p>
                        <div className="flex items-center gap-2">
                          <span className="text-xl font-bold text-gray-900 tabular-nums">
                            {formatTzs(total)}
                          </span>
                          <CopyButton value={String(total)} label="amount" />
                        </div>
                      </div>

                      {/* Jinsi ya kufanya malipo — per-network instructions */}
                      <div className="p-4">
                        <p className="text-sm font-semibold text-gray-900">Jinsi ya kufanya malipo</p>
                        <p className="mt-0.5 text-xs text-gray-500">
                          How to pay — choose your network and follow the steps.
                        </p>
                        <div className="mt-3 flex flex-wrap gap-1.5" role="tablist" aria-label="Mtandao wa malipo">
                          {LIPA_NETWORKS.map((n) => {
                            const active = lipaNetwork === n.id
                            return (
                              <button
                                key={n.id}
                                type="button"
                                role="tab"
                                aria-selected={active}
                                onClick={() => setLipaNetwork(n.id)}
                                className={cn(
                                  'rounded-full border px-3 py-1.5 text-xs font-semibold transition-colors',
                                  active
                                    ? 'border-[#E60000] bg-[#E60000] text-white'
                                    : 'border-gray-200 bg-white text-gray-600 hover:border-gray-300 hover:text-gray-900',
                                )}
                              >
                                {n.name}
                              </button>
                            )
                          })}
                        </div>
                        {LIPA_NETWORKS.filter((n) => n.id === lipaNetwork).map((n) => (
                          <div key={n.id} className="mt-4">
                            <p className="text-xs font-semibold text-gray-700">
                              {n.id === 'other' ? (
                                <>Ingia kwenye <span className="font-bold">{n.dial}</span></>
                              ) : (
                                <>Piga <span className="rounded-md bg-gray-900 px-2 py-0.5 font-mono text-[13px] font-bold text-white">{n.dial}</span></>
                              )}
                            </p>
                            <ol className="mt-3 space-y-2.5">
                              {n.steps.map((step, i) => (
                                <li key={i} className="flex items-start gap-3">
                                  <span className="flex size-5 shrink-0 items-center justify-center rounded-full bg-[#E60000] text-[11px] font-bold text-white tabular-nums">
                                    {i + 1}
                                  </span>
                                  <p className="text-xs leading-relaxed text-gray-700">
                                    <span className="font-bold text-gray-900">{step.do}</span>
                                    {' — '}
                                    {step.detail}
                                  </p>
                                </li>
                              ))}
                            </ol>
                            {n.id === 'vodacom' && (
                              <p className="mt-3 rounded-lg bg-gray-50 px-3 py-2.5 text-xs leading-relaxed text-gray-600">
                                <span className="font-semibold text-gray-900">Au scan QR code:</span>{' '}
                                fungua M-Pesa App, bonyeza kitufe cha QR, scan picha ya QR hapo juu,
                                kisha weka kiasi na PIN yako kukamilisha malipo.
                              </p>
                            )}
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {useLipa && (
                    <div>
                      <Label htmlFor="payer-name" className="mb-1.5 text-gray-900">
                        Name on the account that paid <span className="text-red-600">*</span>
                      </Label>
                      <Input
                        id="payer-name"
                        type="text"
                        value={payerName}
                        onChange={(e) => { setPayerName(e.target.value); clearError('payerName') }}
                        placeholder="e.g. Mary Mwakasege"
                        autoComplete="name"
                        aria-invalid={Boolean(errors.payerName)}
                      />
                      {errors.payerName && <FieldError>{errors.payerName}</FieldError>}
                      <p className="mt-1.5 text-xs text-gray-500">
                        The account holder name the payment came from — as registered with the
                        mobile network or bank.
                      </p>
                    </div>
                  )}

                  <div>
                    <Label htmlFor="mobile-phone" className="mb-1.5 text-gray-900">
                      {useLipa ? 'Your phone number to confirm your payment' : `${method.provider} phone number`}{' '}
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

                  {useLipa && (
                    <div>
                      <Label htmlFor="pay-ref" className="mb-1.5 text-gray-900">
                        Transaction reference number <span className="text-red-600">*</span>
                      </Label>
                      <Input
                        id="pay-ref"
                        type="text"
                        value={payRef}
                        onChange={(e) => { setPayRef(e.target.value); clearError('payRef') }}
                        placeholder="e.g. 9XJ45KQ2RT"
                        autoCapitalize="characters"
                        autoComplete="off"
                        spellCheck={false}
                        className="uppercase placeholder:normal-case"
                        aria-invalid={Boolean(errors.payRef)}
                      />
                      {errors.payRef && <FieldError>{errors.payRef}</FieldError>}
                      <p className="mt-1.5 text-xs text-gray-500">
                        The confirmation code in the SMS you received after paying. The OpusFesta
                        team uses it to verify your payment.
                      </p>
                    </div>
                  )}
                </div>
              )}

              <button
                type="button"
                onClick={handlePay}
                disabled={submitting || items.length === 0}
                className="inline-flex w-full items-center justify-center rounded-full bg-(--accent) px-6 py-3.5 text-[13px] font-extrabold uppercase tracking-[0.06em] text-(--on-accent) transition hover:bg-(--accent-hover) disabled:cursor-not-allowed disabled:bg-gray-300 disabled:text-gray-500"
              >
                {submitting
                  ? 'Processing…'
                  : useLipa
                    ? `I've paid ${formatTzs(total)} — submit order`
                    : `Pay ${formatTzs(total)}`}
              </button>

              <p className="text-xs text-gray-500 inline-flex items-center gap-1.5">
                <ShieldCheck size={13} className="text-emerald-600" />
                {useLipa
                  ? 'Your order is confirmed once the OpusFesta team verifies the transaction. Your design goes live within 24 hours of confirmation.'
                  : 'Payments are processed securely. Your design goes live within 24 hours of confirmation.'}
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
