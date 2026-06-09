'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import {
  Mail,
  Smartphone,
  Clock,
  Sparkles,
  Ticket,
  ArrowRight,
  ShoppingBag,
  Download,
  CreditCard,
} from 'lucide-react'
import Image from 'next/image'
import CheckoutStepper from '@/components/invitations/CheckoutStepper'
import Confetti from '@/components/invitations/Confetti'
import { InvitationVisual } from '@/components/guests/InvitationVisual'
import { getContact, getLastOrder, type StoredOrder } from '@/lib/cart-storage'
import { downloadInvoice } from '@/lib/invoice'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Separator } from '@/components/ui/separator'
import { Button } from '@/components/ui/button'

function formatTzs(n: number): string {
  return `TZS ${n.toLocaleString('en-US')}`
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
  const [order, setOrder] = useState<StoredOrder | null>(null)
  const [mounted, setMounted] = useState(false)
  const [celebrate, setCelebrate] = useState(false)

  useEffect(() => {
    const o = getLastOrder()
    // Backfill the customer name from the saved contact for orders placed
    // before the name was stored on the order itself.
    if (o && !o.contact.name) {
      const c = getContact()
      if (c?.fullName) o.contact = { ...o.contact, name: c.fullName }
    }
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
                  Thank you — your order is confirmed
                </h1>
                <p className="text-muted-foreground max-w-md text-sm">
                  We&apos;ve emailed your receipt to{' '}
                  <span className="font-medium text-gray-900">{order.contact.email}</span>. Your design
                  goes live within 24 hours.
                </p>
              </CardContent>
            </Card>

            <div className="mt-6 grid grid-cols-1 gap-6 lg:grid-cols-[1fr_360px] lg:gap-8">
              {/* LEFT — items + what's next */}
              <div className="space-y-6">
                <div className="space-y-4">
                  <h2 className="text-xl font-semibold text-gray-900">Your order</h2>

                  {/* Meta strip — delivery date · order ID · payment method */}
                  <div className="grid grid-cols-1 divide-y divide-gray-200 rounded-2xl bg-white p-5 shadow-[0_2px_12px_-6px_rgba(0,0,0,0.12)] sm:grid-cols-3 sm:divide-x sm:divide-y-0">
                    <div className="pb-4 sm:pb-0 sm:pr-5">
                      <p className="text-muted-foreground text-sm">Delivery date</p>
                      <p className="mt-1 font-semibold text-gray-900">{estimatedDelivery(order.paidAt)}</p>
                    </div>
                    <div className="py-4 sm:px-5 sm:py-0">
                      <p className="text-muted-foreground text-sm">Order ID</p>
                      <p className="mt-1 font-semibold text-gray-900">#{order.ref}</p>
                    </div>
                    <div className="pt-4 sm:pl-5 sm:pt-0">
                      <p className="text-muted-foreground text-sm">Payment method</p>
                      <div className="mt-1">
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
                          : key === 'signature'
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
                              {item.treatment ? (
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
                      <span className="text-base font-semibold text-gray-900">Total paid</span>
                      <span className="text-xl font-semibold text-gray-900 tabular-nums">
                        {formatTzs(order.total)}
                      </span>
                    </div>
                    {order.paymentLabel && (
                      <p className="text-muted-foreground flex items-center gap-1.5 text-xs">
                        <Smartphone size={12} className="shrink-0" />
                        Paid with {order.paymentLabel}
                      </p>
                    )}
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
