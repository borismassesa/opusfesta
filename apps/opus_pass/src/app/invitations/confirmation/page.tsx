'use client'

import { useEffect, useRef, useState } from 'react'
import Link from 'next/link'
import {
  Mail,
  Clock,
  Sparkles,
  Ticket,
  ArrowRight,
  ShoppingBag,
  Download,
  CreditCard,
  AlertCircle,
  CheckCircle2,
  ChevronDown,
} from 'lucide-react'
import Image from 'next/image'
import CheckoutStepper from '@/components/invitations/CheckoutStepper'
import Confetti from '@/components/invitations/Confetti'
import { InvitationVisual } from '@/components/guests/InvitationVisual'
import { getContact, getLastOrder, setLastOrder, type StoredOrder } from '@/lib/cart-storage'
import { useCart } from '@/components/providers/CartProvider'
import type { StatusResponse } from '@/lib/payments/types'
import { downloadInvoice } from '@/lib/invoice'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Separator } from '@/components/ui/separator'
import { Button } from '@/components/ui/button'

function formatTzs(n: number): string {
  return `TZS ${n.toLocaleString('en-US')}`
}

function formatPaidAt(iso: string): string {
  const d = new Date(iso)
  if (Number.isNaN(d.getTime())) return ''
  return d
    .toLocaleString('en-GB', {
      day: '2-digit',
      month: 'short',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
      hour12: true,
    })
    .replace(',', ' •')
    .replace(/\b(am|pm)\b/i, (match) => match.toUpperCase())
}

// Digital designs are delivered within 24h of payment.
function estimatedDelivery(iso: string): string {
  const d = new Date(iso)
  if (Number.isNaN(d.getTime())) return ''
  d.setDate(d.getDate() + 1)
  return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })
}

const PM_LOGOS = [
  { match: /m-?pesa/i, src: '/assets/payment-logos/m-pesa-logo.png', w: 600, h: 400, cls: 'h-6 w-auto' },
  { match: /airtel/i, src: '/assets/payment-logos/airtel-money.png', w: 390, h: 230, cls: 'h-5 w-auto' },
  { match: /mixx|tigo/i, src: '/assets/payment-logos/mixx-by-yass-tigo-pesa.png', w: 600, h: 400, cls: 'h-6 w-auto' },
]

function PaymentBadge({ label }: { label?: string }) {
  if (!label) return <span className="text-sm text-gray-400">—</span>
  const logo = PM_LOGOS.find((l) => l.match.test(label))
  if (logo) {
    return (
      <span className="inline-flex h-7 items-center justify-center rounded-md border border-gray-200 bg-white px-1.5">
        <Image src={logo.src} alt="" width={logo.w} height={logo.h} className={logo.cls} />
      </span>
    )
  }
  return (
    <span className="inline-flex items-center gap-1.5 text-sm font-semibold text-gray-900">
      <CreditCard size={18} className="text-gray-700" /> Card
    </span>
  )
}

function PaymentStatusCard({ order }: { order: StoredOrder }) {
  const payment = order.payment
  const reference = payment?.reference ?? order.paymentRef
  const provider =
    payment?.provider ??
    (order.paymentLabel
      ? /m-?pesa/i.test(order.paymentLabel)
        ? 'M-Pesa'
        : /card/i.test(order.paymentLabel)
          ? 'Card'
          : undefined
      : undefined)
  const paidAt = formatPaidAt(order.paidAt)
  const verifying = order.paymentStatus === 'verifying'
  const details = [
    payment?.provider && {
      label: 'Method',
      value:
        payment.provider === 'M-Pesa' && payment.businessNumber
          ? 'M-Pesa Lipa Namba'
          : payment.provider,
    },
    payment?.businessNumber && { label: 'Business Number', value: payment.businessNumber },
    payment?.payerName && { label: 'Payer', value: payment.payerName },
    payment?.payerPhone && { label: 'Phone', value: payment.payerPhone },
    reference && { label: 'Reference', value: reference },
    !payment && order.paymentLabel && { label: 'Payment', value: order.paymentLabel },
  ].filter(Boolean) as Array<{ label: string; value: string }>

  return (
    <div
      className={
        verifying
          ? 'rounded-lg border border-amber-200 bg-[#FEF3C7] p-4 text-amber-950'
          : 'rounded-lg border border-emerald-200 bg-emerald-50 p-4 text-emerald-950'
      }
    >
      <div className="flex items-start gap-3">
        <span
          className={
            verifying
              ? 'mt-0.5 inline-flex size-6 shrink-0 items-center justify-center rounded-full bg-amber-400 text-white'
              : 'mt-0.5 inline-flex size-6 shrink-0 items-center justify-center rounded-full bg-emerald-500 text-white'
          }
        >
          {verifying ? <AlertCircle size={15} /> : <CheckCircle2 size={15} />}
        </span>
        <div className="min-w-0 flex-1">
          <p className="text-sm font-semibold">
            {verifying ? 'Payment Under Review' : 'Payment Confirmed'}
          </p>
          {verifying ? (
            <p className="mt-1 text-xs leading-relaxed text-amber-900/80">
              Your payment has been received and is being verified.
            </p>
          ) : provider ? (
            <p className="mt-1 text-xs leading-relaxed text-emerald-900/75">
              Paid via {provider}
            </p>
          ) : null}
          {reference && (
            <p className="mt-2 text-xs text-gray-900">
              <span className="font-medium">Reference:</span>{' '}
              <span className="font-semibold tracking-[0.02em]">{reference}</span>
            </p>
          )}
          {verifying ? (
            <p className="mt-3 max-w-[15rem] text-xs leading-relaxed text-amber-900/75">
              Usually verified within 15 minutes.
            </p>
          ) : paidAt ? (
            <p className="mt-2 text-xs font-medium text-emerald-900/70">{paidAt}</p>
          ) : null}

          {details.length > 0 && (
            <details className="group mt-3 border-t border-black/10 pt-3">
              <summary className="flex cursor-pointer list-none items-center justify-between gap-3 text-xs font-semibold text-gray-900">
                Payment details
                <ChevronDown
                  size={14}
                  className="shrink-0 transition group-open:rotate-180"
                  aria-hidden="true"
                />
              </summary>
              <dl className="mt-3 space-y-2 text-xs">
                {details.map((detail) => (
                  <div key={detail.label} className="flex items-start justify-between gap-4">
                    <dt className="text-gray-700">{detail.label}</dt>
                    <dd className="max-w-[11rem] text-right font-medium text-gray-950">
                      {detail.value}
                    </dd>
                  </div>
                ))}
              </dl>
            </details>
          )}
        </div>
      </div>
    </div>
  )
}

const NEXT_STEPS = [
  {
    Icon: Sparkles,
    title: 'We personalise your design',
    body: 'Our team tailors your invitation with your details, ready within 24 hours.',
  },
  {
    Icon: Mail,
    title: 'You review a proof',
    body: 'We send a proof for your approval — one free round of revisions is included.',
  },
  {
    Icon: Ticket,
    title: 'Share & check in',
    body: 'Get a shareable link plus OpusPass tickets with QR codes for entrance scanning.',
  },
]

export default function ConfirmationPage() {
  const { clear } = useCart()
  const [order, setOrder] = useState<StoredOrder | null>(null)
  const [mounted, setMounted] = useState(false)
  const [celebrate, setCelebrate] = useState(false)
  const cartCleared = useRef(false)

  // Reconcile against the authoritative server status by ref. This is what
  // makes the page honest after a card redirect or manual finance approval.
  useEffect(() => {
    const params = new URLSearchParams(window.location.search)
    const ref = params.get('ref') ?? order?.ref
    if (!ref) return
    let cancelled = false
    let attempts = 0
    const sync = async () => {
      attempts++
      try {
        const res = await fetch(`/api/payments/status?ref=${encodeURIComponent(ref)}`, {
          cache: 'no-store',
        })
        if (res.status === 404) return
        if (res.ok) {
          const data = (await res.json()) as StatusResponse
          if (cancelled) return
          if (data.status === 'paid') {
            setOrder((prev) => {
              if (!prev || prev.ref !== ref) return prev
              const next: StoredOrder = {
                ...prev,
                paidAt: data.paidAt ?? prev.paidAt,
                paymentStatus: 'paid',
              }
              setLastOrder(next)
              return next
            })
            if (!cartCleared.current) {
              cartCleared.current = true
              clear()
            }
            return
          }
          if (data.status === 'processing' || data.status === 'pending') {
            setOrder((prev) => {
              if (!prev || prev.ref !== ref || prev.paymentStatus === 'verifying') return prev
              const next: StoredOrder = { ...prev, paymentStatus: 'verifying' }
              setLastOrder(next)
              return next
            })
          }
          if (data.status === 'failed' || data.status === 'expired') return
        }
      } catch {
        /* transient — retry */
      }
      if (!cancelled && attempts < 8) window.setTimeout(sync, 3000)
    }
    void sync()
    return () => {
      cancelled = true
    }
  }, [order?.ref, clear])

  useEffect(() => {
    const o = getLastOrder()
    // Backfill the customer name from the saved contact for orders placed
    // before the name was stored on the order itself.
    if (o && !o.contact.name) {
      const c = getContact()
      if (c?.fullName) o.contact = { ...o.contact, name: c.fullName }
    }
    queueMicrotask(() => {
      setOrder(o)
      setMounted(true)
      // Fire confetti once per order (not on every refresh of this page).
      if (o) {
        const key = `opuspass.celebrated.${o.ref}`
        try {
          if (!sessionStorage.getItem(key)) {
            setCelebrate(true)
            sessionStorage.setItem(key, '1')
          }
        } catch {
          setCelebrate(true)
        }
      }
    })
  }, [])

  return (
    <main className="bg-gray-50 min-h-screen py-8">
      <div className="max-w-7xl mx-auto px-4 lg:px-8">
        <CheckoutStepper current="confirmation" />

        {/* Empty state — no recent order in storage */}
        {mounted && !order && (
          <Card className="mx-auto max-w-lg border-0 shadow-[0_2px_12px_-6px_rgba(0,0,0,0.12)]">
            <CardContent className="flex flex-col items-center py-14 text-center">
              <span className="mb-3 inline-flex size-12 items-center justify-center rounded-full bg-gray-100 text-gray-400">
                <ShoppingBag size={22} />
              </span>
              <p className="text-sm font-semibold text-gray-700">No recent order found.</p>
              <p className="text-muted-foreground mt-1 text-xs">
                Once you complete a purchase, your confirmation will appear here.
              </p>
              <Link
                href="/invitations/catalog"
                className="mt-5 inline-flex items-center justify-center gap-2 rounded-full bg-(--accent) px-6 py-3 text-[13px] font-extrabold uppercase tracking-[0.06em] text-(--on-accent) transition hover:bg-(--accent-hover)"
              >
                Browse designs
                <ArrowRight size={15} className="shrink-0" />
              </Link>
            </CardContent>
          </Card>
        )}

        {order && (
          <>
            {celebrate && <Confetti />}
            {/* Success header */}
            <Card className="border-0 shadow-[0_2px_12px_-6px_rgba(0,0,0,0.12)]">
              <CardContent className="flex flex-col items-center gap-2 py-6 text-center sm:py-7">
                <span
                  className="inline-flex items-center justify-center text-5xl leading-none"
                  role="img"
                  aria-label="Celebration"
                >
                  🎉
                </span>
                <h1 className="text-2xl font-semibold text-gray-900 sm:text-3xl">
                  {order.paymentStatus === 'verifying'
                    ? 'Asante — we’ve received your order'
                    : 'Thank you — your order is confirmed'}
                </h1>
                {order.paymentStatus === 'verifying' ? (
                  <p className="text-muted-foreground max-w-md text-sm">
                    The OpusFesta team is verifying your payment
                    {order.paymentRef && (
                      <>
                        {' '}
                        (ref <span className="font-medium text-gray-900">{order.paymentRef}</span>)
                      </>
                    )}
                    . Once confirmed, we&apos;ll email your receipt to{' '}
                    <span className="font-medium text-gray-900">{order.contact.email}</span> and your
                    design goes live within 24 hours.
                  </p>
                ) : (
                  <p className="text-muted-foreground max-w-md text-sm">
                    We&apos;ve emailed your receipt to{' '}
                    <span className="font-medium text-gray-900">{order.contact.email}</span>. Your design
                    goes live within 24 hours.
                  </p>
                )}
              </CardContent>
            </Card>

            <div className="mt-6 grid grid-cols-1 gap-6 lg:grid-cols-[1fr_360px] lg:gap-8">
              {/* LEFT — items + what's next */}
              <div className="space-y-6">
                <div className="space-y-4">
                  <h2 className="text-xl font-semibold text-gray-900">Your order</h2>

                  {/* Meta strip — delivery date · order ID · payment method */}
                  <div className="grid grid-cols-1 divide-y divide-gray-200 rounded-2xl bg-white p-5 shadow-[0_2px_12px_-6px_rgba(0,0,0,0.12)] sm:grid-cols-3 sm:divide-x sm:divide-y-0">
                    <div className="flex items-center justify-between gap-3 pb-4 sm:block sm:pb-0 sm:pr-5">
                      <p className="text-muted-foreground text-sm">Delivery date</p>
                      <p className="font-semibold text-gray-900 sm:mt-1">{estimatedDelivery(order.paidAt)}</p>
                    </div>
                    <div className="flex items-center justify-between gap-3 py-4 sm:block sm:px-5 sm:py-0">
                      <p className="text-muted-foreground text-sm">Order ID</p>
                      <p className="font-semibold text-gray-900 sm:mt-1">#{order.ref}</p>
                    </div>
                    <div className="flex items-center justify-between gap-3 pt-4 sm:block sm:pl-5 sm:pt-0">
                      <p className="text-muted-foreground text-sm">Payment method</p>
                      <div className="sm:mt-1">
                        <PaymentBadge label={order.paymentLabel} />
                      </div>
                    </div>
                  </div>

                  {/* Item rows — mirror the cart line item for design consistency */}
                  <div className="space-y-3">
                    {order.items.map((item) => {
                      const key = (item.tierId ?? item.tier ?? '').toLowerCase()
                      const pill =
                        key === 'classic'
                          ? 'bg-[#EFE3FA] text-[#6B4E8C]'
                          : key === 'elegant' || key === 'signature'
                            ? 'bg-[#F5EACF] text-[#8A6B1E]'
                            : 'bg-gray-100 text-gray-700'
                      return (
                        <div
                          key={item.id}
                          className="flex gap-6 rounded-xl border border-gray-200 p-4 sm:p-5 max-sm:flex-col sm:items-center"
                        >
                          <div className="flex grow items-center gap-4">
                            <Link
                              href={`/invitations/p/${item.id}`}
                              className="relative aspect-[5/7] w-20 shrink-0 overflow-hidden rounded-md bg-white shadow-sm ring-1 ring-black/5"
                            >
                              {item.image ? (
                                <Image src={item.image} alt="" fill sizes="80px" className="object-cover" unoptimized />
                              ) : item.treatment ? (
                                <InvitationVisual treatment={item.treatment} />
                              ) : (
                                <span className="flex h-full w-full items-center justify-center bg-gradient-to-br from-(--accent)/20 to-(--accent)/5 text-[#7C5AA6]">
                                  <Ticket size={22} />
                                </span>
                              )}
                            </Link>

                            <div className="flex flex-col justify-between gap-3">
                              <div className="flex flex-col gap-1.5">
                                <Link
                                  href={`/invitations/p/${item.id}`}
                                  className="font-medium text-gray-900 hover:underline"
                                >
                                  {item.name}
                                </Link>
                                {item.tier && (
                                  <span
                                    className={`w-fit rounded px-1.5 py-0.5 text-[10px] font-bold uppercase tracking-wide ${pill}`}
                                  >
                                    {item.tier} Package
                                  </span>
                                )}
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
                              <div className="flex items-center gap-2">
                                <Clock className="size-4 text-gray-500" />
                                <p className="text-muted-foreground text-sm">Delivered within 24 hours</p>
                              </div>
                            </div>
                          </div>

                          <div className="flex items-center gap-8 sm:gap-14">
                            {item.guests != null && (
                              <div className="flex flex-col items-center gap-1.5">
                                <span className="text-muted-foreground text-[10px] font-medium uppercase tracking-wide">
                                  Guests
                                </span>
                                <span className="inline-flex h-9 min-w-[3.5rem] items-center justify-center rounded-lg border border-gray-200 bg-white px-4 text-sm font-semibold tabular-nums text-gray-900 shadow-sm">
                                  {item.guests}
                                </span>
                              </div>
                            )}
                            <p className="shrink-0 whitespace-nowrap text-lg font-semibold text-gray-900 tabular-nums">
                              {formatTzs(item.total)}
                            </p>
                          </div>
                        </div>
                      )
                    })}
                  </div>
                </div>

                <Card className="border-0 shadow-[0_2px_12px_-6px_rgba(0,0,0,0.12)]">
                  <CardHeader>
                    <CardTitle className="text-xl font-semibold">What happens next</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <ol className="space-y-5">
                      {NEXT_STEPS.map((step, i) => (
                        <li key={step.title} className="flex gap-4">
                          <span className="relative flex flex-col items-center">
                            <span className="flex size-9 shrink-0 items-center justify-center rounded-full bg-(--accent)/10 text-gray-900">
                              <step.Icon size={17} />
                            </span>
                            {i < NEXT_STEPS.length - 1 && (
                              <span className="mt-1 w-px grow bg-gray-200" aria-hidden />
                            )}
                          </span>
                          <div className="pb-1">
                            <p className="font-semibold text-gray-900">{step.title}</p>
                            <p className="text-muted-foreground mt-0.5 text-sm leading-relaxed">
                              {step.body}
                            </p>
                          </div>
                        </li>
                      ))}
                    </ol>
                  </CardContent>
                </Card>
              </div>

              {/* RIGHT — summary + actions */}
              <aside className="flex flex-col gap-5">
                <Card className="border-0 shadow-[0_2px_12px_-6px_rgba(0,0,0,0.12)]">
                  <CardHeader>
                    <CardTitle className="text-xl font-semibold">Payment summary</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-muted-foreground">Price</span>
                      <span className="font-medium text-gray-900 tabular-nums">
                        {formatTzs(order.subtotal)}
                      </span>
                    </div>
                    {order.discount > 0 && (
                      <div className="flex items-center justify-between text-sm">
                        <span className="text-muted-foreground">Discount</span>
                        <span className="font-medium text-green-600 tabular-nums">
                          -{formatTzs(order.discount)}
                        </span>
                      </div>
                    )}
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-muted-foreground">Delivery charges</span>
                      <span className="font-semibold text-gray-900">Free delivery</span>
                    </div>
                    <Separator />
                    <div className="flex items-center justify-between">
                      <span className="text-base font-semibold text-gray-900">
                        {order.paymentStatus === 'verifying' ? 'Total' : 'Total paid'}
                      </span>
                      <span className="text-xl font-semibold text-gray-900 tabular-nums">
                        {formatTzs(order.total)}
                      </span>
                    </div>
                    <PaymentStatusCard order={order} />
                    <Separator />
                    <Button
                      variant="outline"
                      size="lg"
                      className="w-full rounded-full"
                      onClick={() => downloadInvoice(order)}
                    >
                      <Download size={15} className="shrink-0" />
                      Download invoice
                    </Button>
                  </CardContent>
                </Card>

                <div className="flex flex-col gap-2.5">
                  <Link
                    href="/invitations/catalog"
                    className="inline-flex w-full items-center justify-center gap-2 rounded-full bg-(--accent) px-6 py-3.5 text-[13px] font-extrabold uppercase tracking-[0.06em] text-(--on-accent) transition hover:bg-(--accent-hover)"
                  >
                    Browse more designs
                    <ArrowRight size={15} className="shrink-0" />
                  </Link>
                  <Button asChild variant="outline" size="lg" className="w-full rounded-full">
                    <Link href="/invitations">Back to invitations</Link>
                  </Button>
                </div>

                <p className="text-muted-foreground flex items-center justify-center gap-1.5 text-xs">
                  <Clock size={13} className="text-emerald-600" />
                  Designs delivered within 24 hours
                </p>
              </aside>
            </div>
          </>
        )}
      </div>
    </main>
  )
}
