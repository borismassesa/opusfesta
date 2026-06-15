'use client'

import { useEffect, useRef, useState } from 'react'
import Image from 'next/image'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { Smartphone, ShieldCheck, AlertCircle, Mail, Clock, Sparkles, MapPin, Pencil, Copy, Check, Loader2, Lock } from 'lucide-react'
import CheckoutStepper from '@/components/invitations/CheckoutStepper'
import { useCart } from '@/components/providers/CartProvider'
import {
  getContact,
  getLastOrder,
  setLastOrder,
  type StoredContact,
  type StoredOrder,
  type StoredOrderPayment,
} from '@/lib/cart-storage'
import type { InitiateRequest, InitiateResponse, StatusResponse } from '@/lib/payments/types'
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
// Automated Selcom payments (M-Pesa STK push + card) are gated behind this flag.
// Until OpusFesta has a Selcom merchant account, it stays OFF and checkout uses
// only the manual Lipa Namba flow: the customer pays externally and enters their
// name, phone, and transaction reference; the OpusFesta team confirms it.
// Flip NEXT_PUBLIC_PAYMENTS_SELCOM_ENABLED=true (with SELCOM_* server creds) to
// turn the automated push + card options on.
const SELCOM_ENABLED = process.env.NEXT_PUBLIC_PAYMENTS_SELCOM_ENABLED === 'true'

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

type Errors = Partial<
  Record<'mobilePhone' | 'payerName' | 'payRef' | 'cart' | 'contact', string>
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
  // M-Pesa offers two paths: an automated STK push (PIN prompt on the phone)
  // and the manual Lipa Namba flow (pay externally, enter the confirmation code).
  // With Selcom off, only the manual flow is available, so default to it.
  const [mpesaMode, setMpesaMode] = useState<'push' | 'lipa'>(SELCOM_ENABLED ? 'push' : 'lipa')
  const [lipaNetwork, setLipaNetwork] = useState<string>('vodacom')

  // Automated-payment phase: while we wait for the customer to enter their PIN
  // we show a blocking modal and poll the order status until it resolves.
  const [payPhase, setPayPhase] = useState<'idle' | 'awaiting' | 'redirecting'>('idle')
  const [payError, setPayError] = useState<string | null>(null)
  const pollTimer = useRef<ReturnType<typeof setTimeout> | null>(null)
  useEffect(() => () => { if (pollTimer.current) clearTimeout(pollTimer.current) }, [])

  const [mobilePhone, setMobilePhone] = useState('')
  const [payerName, setPayerName] = useState('')
  const [payRef, setPayRef] = useState('')

  const [errors, setErrors] = useState<Errors>({})
  const [submitting, setSubmitting] = useState(false)
  const [contact, setContactState] = useState<StoredContact | null>(null)

  useEffect(() => {
    queueMicrotask(() => setContactState(getContact()))
  }, [])

  // Card requires the Selcom hosted page — hide it until Selcom is enabled
  // (otherwise there's no way to actually charge a card).
  const visibleMethods = SELCOM_ENABLED
    ? PAYMENT_METHODS
    : PAYMENT_METHODS.filter((m) => m.id !== 'card')

  const method = PAYMENT_METHODS.find((m) => m.id === selected) ?? PAYMENT_METHODS[0]
  const isCard = method.kind === 'card'
  const isMpesa = method.id === 'mpesa'
  // Automated M-Pesa push (default) vs. the manual Lipa Namba fallback.
  const usePush = isMpesa && mpesaMode === 'push'
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
    if (isCard) return 'Card (Visa / Mastercard)'
    if (useLipa)
      return `M-Pesa Lipa Namba ${MPESA_LIPA_NAMBA} · ${payerName.trim()} · ${mobilePhone.trim()} · Ref ${payRef.trim().toUpperCase()}`
    return `${method.provider} ${mobilePhone.trim()}`
  }

  const paymentDetails = (): StoredOrderPayment => {
    if (isCard) return { provider: 'Card' }
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
      // Card details are collected on Selcom's secure hosted page — nothing to
      // validate here (we never touch the raw card number).
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

  // Cart lines in the shape /api/payments/initiate expects (the server
  // re-prices these against the CMS — the totals here are not trusted).
  const itemsPayload = (): InitiateRequest['items'] =>
    items.map((i) => ({
      id: i.id,
      name: i.name,
      image: i.image,
      summary: i.summary,
      tier: i.tier,
      tierId: i.tierId,
      guests: i.guests,
      pricePerGuest: i.pricePerGuest,
      extrasTotal: i.extrasTotal,
      addOns: i.addOns,
      total: i.total,
    }))

  // Local snapshot for the confirmation page's display. The authoritative
  // paid/failed state always comes from the server (fetched by ref); this is a
  // placeholder shown while that loads.
  const buildLocalOrder = (
    ref: string,
    paymentStatus: 'verifying' | 'paid',
  ): StoredOrder => ({
    ref,
    paidAt: new Date().toISOString(),
    paymentLabel: paymentLabel(),
    payment: paymentDetails(),
    paymentRef: useLipa ? payRef.trim().toUpperCase() : undefined,
    paymentStatus,
    contact: { name: contact!.fullName, email: contact!.email, phone: contact!.phone },
    items: items.map((i) => ({
      id: i.id,
      name: i.name,
      summary: i.summary,
      total: i.total,
      image: i.image,
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

  // Poll the order status while the customer enters their PIN, until the
  // payment resolves or we hit the timeout.
  const pollUntilResolved = (ref: string) => {
    const startedAt = Date.now()
    const TIMEOUT_MS = 120_000
    const tick = async () => {
      try {
        const res = await fetch(`/api/payments/status?ref=${encodeURIComponent(ref)}`, {
          cache: 'no-store',
        })
        if (res.status === 404) {
          // Order vanished — surface immediately rather than waiting out the timeout.
          setPayPhase('idle')
          setSubmitting(false)
          setPayError('We could not find your order. Please try again.')
          return
        }
        const data = (await res.json()) as StatusResponse
        if (data.status === 'paid') {
          // Promote the local snapshot to paid so the confirmation page and
          // invoice read 'paid' immediately, before the server re-confirms.
          const stored = getLastOrder()
          if (stored && stored.ref === ref) setLastOrder({ ...stored, paymentStatus: 'paid' })
          clear()
          router.push(`/invitations/confirmation?ref=${ref}`)
          return
        }
        if (data.status === 'failed' || data.status === 'expired') {
          setPayPhase('idle')
          setSubmitting(false)
          setPayError('The payment was declined or cancelled. Please try again.')
          return
        }
      } catch {
        /* transient network blip — keep polling */
      }
      if (Date.now() - startedAt > TIMEOUT_MS) {
        setPayPhase('idle')
        setSubmitting(false)
        setPayError(
          "We didn't get a confirmation in time. If you approved the prompt, your order will appear shortly — otherwise please try again.",
        )
        return
      }
      pollTimer.current = setTimeout(tick, 3000)
    }
    pollTimer.current = setTimeout(tick, 3000)
  }

  const handlePay = async () => {
    setPayError(null)
    const e = validate()
    setErrors(e)
    if (Object.keys(e).length > 0) return
    if (!contact) return

    // ── Manual Lipa Namba: the customer paid externally and entered their
    // confirmation code. Recorded as 'verifying' for the team to reconcile.
    if (useLipa) {
      setSubmitting(true)
      try {
        const payload: InitiateRequest = {
          method: 'lipa_namba',
          phone: mobilePhone.trim(),
          payerName: payerName.trim(),
          paymentReference: payRef.trim().toUpperCase(),
          contact: { name: contact.fullName, email: contact.email, phone: contact.phone },
          items: itemsPayload(),
          paymentLabel: paymentLabel(),
        }
        const res = await fetch('/api/payments/initiate', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload),
        })
        const data = (await res.json()) as InitiateResponse
        if (!res.ok || !data.ref) {
          setSubmitting(false)
          setPayError(data.message ?? 'Payment could not be submitted. Please try again.')
          return
        }
        setLastOrder(buildLocalOrder(data.ref, 'verifying'))
        clear()
        router.push(`/invitations/confirmation?ref=${encodeURIComponent(data.ref)}`)
      } finally {
        setSubmitting(false)
      }
      return
    }

    // ── Automated Selcom flows: M-Pesa push or card redirect.
    setSubmitting(true)
    setPayPhase(isCard ? 'redirecting' : 'awaiting')
    try {
      const payload: InitiateRequest = {
        method: isCard ? 'card' : 'mobile',
        phone: isCard ? undefined : mobilePhone.trim(),
        contact: { name: contact.fullName, email: contact.email, phone: contact.phone },
        items: itemsPayload(),
        paymentLabel: paymentLabel(),
      }
      const res = await fetch('/api/payments/initiate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      })
      const data = (await res.json()) as InitiateResponse
      if (!res.ok || data.status === 'failed' || !data.ref) {
        setPayPhase('idle')
        setSubmitting(false)
        setPayError(data.message ?? 'Payment could not be started. Please try again.')
        return
      }

      // Keep a local copy so the confirmation page can render immediately; the
      // real paid state is fetched there by ref.
      setLastOrder(buildLocalOrder(data.ref, 'verifying'))

      if (isCard) {
        if (!data.redirectUrl) {
          setPayPhase('idle')
          setSubmitting(false)
          setPayError('Card payment is unavailable right now. Please try M-Pesa.')
          return
        }
        // Hand off to Selcom's secure hosted card page.
        window.location.href = data.redirectUrl
        return
      }

      // Mobile push sent — wait for the PIN approval.
      pollUntilResolved(data.ref)
    } catch {
      setPayPhase('idle')
      setSubmitting(false)
      setPayError('Something went wrong starting the payment. Please try again.')
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
                  {visibleMethods.map((m) => {
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
                <div className="rounded-xl border border-gray-200 bg-gray-50 p-5">
                  <div className="flex items-start gap-3">
                    <span className="flex size-9 shrink-0 items-center justify-center rounded-full bg-white text-gray-900 ring-1 ring-gray-200">
                      <Lock size={16} />
                    </span>
                    <div className="space-y-1.5">
                      <p className="text-sm font-semibold text-gray-900">
                        Secure card payment
                      </p>
                      <p className="text-xs leading-relaxed text-gray-600">
                        When you continue, we&apos;ll take you to our payment
                        partner&apos;s secure page to enter your Visa or Mastercard details
                        and complete 3-D Secure verification. OpusFesta never sees or stores
                        your card number.
                      </p>
                      <div className="flex items-center gap-2 pt-1">
                        <Image src="/assets/payment-logos/visa.svg" alt="Visa" width={1000} height={325} className="h-4 w-auto" />
                        <Image src="/assets/payment-logos/mastercard.svg" alt="Mastercard" width={1000} height={618} className="h-6 w-auto" />
                      </div>
                    </div>
                  </div>
                </div>
              ) : (
                <div className="space-y-4">
                  {/* M-Pesa path toggle: automated phone prompt vs. manual Lipa
                      Namba. Only shown when Selcom is enabled — otherwise the
                      manual flow is the only option. */}
                  {SELCOM_ENABLED && (
                    <div className="inline-flex rounded-full border border-gray-200 bg-gray-50 p-1">
                      <button
                        type="button"
                        onClick={() => { setMpesaMode('push'); setPayError(null) }}
                        aria-pressed={mpesaMode === 'push'}
                        className={cn(
                          'rounded-full px-4 py-1.5 text-sm font-semibold transition-colors',
                          mpesaMode === 'push' ? 'bg-white text-gray-900 shadow-sm' : 'text-gray-600 hover:text-gray-900',
                        )}
                      >
                        Phone prompt
                      </button>
                      <button
                        type="button"
                        onClick={() => { setMpesaMode('lipa'); setPayError(null) }}
                        aria-pressed={mpesaMode === 'lipa'}
                        className={cn(
                          'rounded-full px-4 py-1.5 text-sm font-semibold transition-colors',
                          mpesaMode === 'lipa' ? 'bg-white text-gray-900 shadow-sm' : 'text-gray-600 hover:text-gray-900',
                        )}
                      >
                        Lipa Namba
                      </button>
                    </div>
                  )}

                  {usePush && (
                    <div className="flex items-start gap-3 rounded-xl border border-gray-200 bg-gray-50 p-4">
                      <span className="flex size-9 shrink-0 items-center justify-center rounded-full bg-white text-gray-900 ring-1 ring-gray-200">
                        <Smartphone size={16} />
                      </span>
                      <p className="text-xs leading-relaxed text-gray-600">
                        Enter your M-Pesa number below and tap <span className="font-semibold text-gray-900">Pay</span>.
                        A prompt pops up on your phone — enter your PIN to approve. We confirm
                        automatically, no codes to copy.
                      </p>
                    </div>
                  )}

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

              {payError && (
                <div className="flex items-start gap-2 rounded-md border border-red-300 bg-red-50 p-3 text-sm text-red-800">
                  <AlertCircle size={15} className="mt-0.5 shrink-0" />
                  <span>{payError}</span>
                </div>
              )}

              <button
                type="button"
                onClick={handlePay}
                disabled={submitting || payPhase !== 'idle' || items.length === 0}
                className="inline-flex w-full items-center justify-center gap-2 rounded-full bg-(--accent) px-6 py-3.5 text-[13px] font-extrabold uppercase tracking-[0.06em] text-(--on-accent) transition hover:bg-(--accent-hover) disabled:cursor-not-allowed disabled:bg-gray-300 disabled:text-gray-500"
              >
                {submitting && <Loader2 size={15} className="animate-spin" />}
                {submitting
                  ? payPhase === 'redirecting'
                    ? 'Redirecting…'
                    : payPhase === 'awaiting'
                      ? 'Waiting for approval…'
                      : 'Processing…'
                  : isCard
                    ? `Continue to secure card payment`
                    : useLipa
                      ? `I've paid ${formatTzs(total)} — submit order`
                      : `Pay ${formatTzs(total)}`}
              </button>

              <p className="text-xs text-gray-500 inline-flex items-center gap-1.5">
                <ShieldCheck size={13} className="text-emerald-600" />
                {useLipa
                  ? 'Your order is confirmed once the OpusFesta team verifies the transaction. Your design goes live within 24 hours of confirmation.'
                  : isCard
                    ? 'Card payments are processed securely by our payment partner (3-D Secure). Your design goes live within 24 hours of confirmation.'
                    : 'Approve the prompt on your phone to pay. Your design goes live within 24 hours of confirmation.'}
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

      {/* Waiting overlay — shown while the M-Pesa PIN prompt is on the phone. */}
      {payPhase === 'awaiting' && (
        <div
          role="dialog"
          aria-modal="true"
          aria-label="Awaiting payment approval"
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4"
        >
          <div className="w-full max-w-sm rounded-2xl bg-white p-7 text-center shadow-2xl">
            <span className="mx-auto mb-4 flex size-14 items-center justify-center rounded-full bg-(--accent)/15 text-gray-900">
              <Smartphone size={26} />
            </span>
            <h2 className="text-lg font-semibold text-gray-900">Check your phone</h2>
            <p className="mt-1.5 text-sm leading-relaxed text-gray-600">
              We sent a payment prompt to{' '}
              <span className="font-semibold text-gray-900">{mobilePhone.trim()}</span>. Enter your
              M-Pesa PIN to approve <span className="font-semibold text-gray-900">{formatTzs(total)}</span>.
            </p>
            <div className="mt-5 inline-flex items-center gap-2 text-sm font-medium text-gray-500">
              <Loader2 size={16} className="animate-spin" />
              Waiting for confirmation…
            </div>
            <p className="mt-4 text-xs text-gray-400">
              Keep this page open — it updates automatically once you approve.
            </p>
          </div>
        </div>
      )}
    </main>
  )
}
