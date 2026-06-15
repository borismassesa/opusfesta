'use client'

import { Fragment, useEffect, useMemo, useState } from 'react'
import Link from 'next/link'
import Image from 'next/image'
import { Receipt, Download, Check, Clock, Package, ArrowRight, Ticket } from 'lucide-react'
import { InvitationVisual } from '@/components/guests/InvitationVisual'
import { getOrders, setLastOrder, type StoredOrder, type StoredOrderItem } from '@/lib/cart-storage'
import { downloadInvoice } from '@/lib/invoice'
import { ORDER_STAGES, currentStageIndex, stageTone, type OrderStatusTone } from '@/lib/order-status'
import type { StatusResponse } from '@/lib/payments/types'
import { Card, StatCard, EmptyState } from '@/components/dashboard/primitives'
import { Button } from '@/components/dashboard/controls'
import { cn } from '@/lib/utils'

function formatTzs(n: number): string {
  return `TZS ${n.toLocaleString('en-US')}`
}

function formatDate(iso: string): string {
  const d = new Date(iso)
  if (Number.isNaN(d.getTime())) return ''
  return d.toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' })
}

const TONE_PILL: Record<OrderStatusTone, string> = {
  neutral: 'bg-neutral-100 text-neutral-600 ring-neutral-500/20',
  amber: 'bg-amber-50 text-amber-700 ring-amber-600/20',
  emerald: 'bg-emerald-50 text-emerald-700 ring-emerald-600/20',
}

const META_PILL = 'inline-flex items-center rounded-full px-2 py-0.5 text-[11px] font-medium'
const GREEN_PILL = 'bg-[#9FE870]/25 text-[#3f6b1f]'

/** Tier pill colours — mirrors the cart card and the invoice PDF swatches. */
function tierPillClass(item: StoredOrderItem): string {
  const key = (item.tierId ?? item.tier ?? '').toLowerCase()
  if (key === 'classic') return 'bg-[#EFE3FA] text-[#6B4E8C]'
  if (key === 'elegant' || key === 'signature') return 'bg-[#F5EACF] text-[#8A6B1E]'
  return 'bg-[#E1E8F0] text-[#475569]'
}

/**
 * Line-item config rendered as pills. Prefers the structured fields — the
 * stored `summary` string is a snapshot taken at add-to-cart time and can
 * carry a stale guest count if the order was edited in the cart, whereas
 * `guests`/`tier`/`addOns` are kept current. The summary split is only a
 * fallback for legacy orders stored before the structured fields existed.
 */
function ItemPills({ item }: { item: StoredOrderItem }) {
  const hasStructured = Boolean(item.tier) || item.guests != null || (item.addOns?.length ?? 0) > 0
  const pills = hasStructured
    ? [
        ...(item.tier ? [{ label: item.tier, className: tierPillClass(item) }] : []),
        ...(item.guests != null
          ? [{ label: `${item.guests.toLocaleString('en-US')} guests`, className: GREEN_PILL }]
          : []),
        ...(item.addOns ?? []).map((a) => ({ label: a, className: GREEN_PILL })),
      ]
    : item.summary
        .split(' · ')
        .filter(Boolean)
        .map((part) => ({ label: part, className: GREEN_PILL }))

  if (pills.length === 0) return null
  return (
    <div className="mt-1 flex flex-wrap gap-1">
      {pills.map((p) => (
        <span key={p.label} className={cn(META_PILL, p.className)}>
          {p.label}
        </span>
      ))}
    </div>
  )
}

function OrderTracker({ activeIndex }: { activeIndex: number }) {
  const last = ORDER_STAGES.length - 1
  return (
    <div className="flex items-center">
      {ORDER_STAGES.map((stage, i) => {
        const done = i < activeIndex
        const current = i === activeIndex
        return (
          <Fragment key={stage.id}>
            <div className="flex items-center gap-2">
              <span
                className={cn(
                  'flex size-6 shrink-0 items-center justify-center rounded-full text-[11px] font-bold ring-1 ring-inset',
                  done && 'bg-[#1A1A1A] text-white ring-[#1A1A1A]',
                  current && 'bg-[#1A1A1A]/10 text-[#1A1A1A] ring-[#1A1A1A]/30',
                  !done && !current && 'bg-black/[0.04] text-[#1A1A1A]/40 ring-black/10',
                )}
              >
                {done ? <Check className="size-3.5" strokeWidth={3} /> : i + 1}
              </span>
              <span
                className={cn(
                  'hidden text-xs font-medium sm:inline',
                  done || current ? 'text-[#1A1A1A]' : 'text-[#1A1A1A]/45',
                )}
              >
                {stage.label}
              </span>
            </div>
            {i < last && (
              <span
                className={cn(
                  'mx-2 h-px flex-1 rounded-full',
                  i < activeIndex ? 'bg-[#1A1A1A]' : 'bg-black/10',
                )}
              />
            )}
          </Fragment>
        )
      })}
    </div>
  )
}

function OrderCard({ order }: { order: StoredOrder }) {
  const idx = currentStageIndex(order)
  const stage = ORDER_STAGES[idx]
  const tone = stageTone(stage.id)
  const itemCount = order.items.length

  return (
    <Card className="overflow-hidden">
      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-3 border-b border-black/[0.06] px-5 py-4">
        <div className="flex items-baseline gap-3">
          <span className="font-bold text-[#1A1A1A]">#{order.ref}</span>
          <span className="text-xs text-[#1A1A1A]/50">{formatDate(order.paidAt)}</span>
        </div>
        <div className="flex items-center gap-3">
          <span
            className={cn(
              'inline-flex items-center gap-1 rounded-full px-2.5 py-0.5 text-xs font-medium ring-1 ring-inset',
              TONE_PILL[tone],
            )}
          >
            {stage.label}
          </span>
          <span className="text-sm font-bold text-[#1A1A1A] tabular-nums">{formatTzs(order.total)}</span>
        </div>
      </div>

      {/* Items */}
      <div className="divide-y divide-black/[0.05]">
        {order.items.map((item) => (
          <div key={item.id} className="flex items-center gap-3 px-5 py-3">
            <div className="relative aspect-[5/7] w-10 shrink-0 overflow-hidden rounded-md bg-white shadow-sm ring-1 ring-black/5">
              {item.image ? (
                <Image src={item.image} alt="" fill sizes="40px" className="object-cover" unoptimized />
              ) : item.treatment ? (
                <InvitationVisual treatment={item.treatment} />
              ) : (
                <span className="flex h-full w-full items-center justify-center bg-gradient-to-br from-[#C9A0DC]/20 to-[#C9A0DC]/5 text-[#7C5AA6]">
                  <Ticket className="size-4" />
                </span>
              )}
            </div>
            <div className="min-w-0 grow">
              <p className="truncate text-sm font-medium text-[#1A1A1A]">{item.name}</p>
              <ItemPills item={item} />
            </div>
            <span className="shrink-0 whitespace-nowrap text-sm font-semibold text-[#1A1A1A] tabular-nums">
              {formatTzs(item.total)}
            </span>
          </div>
        ))}
      </div>

      {/* Tracker */}
      <div className="border-t border-black/[0.06] px-5 py-4">
        <OrderTracker activeIndex={idx} />
        <p className="mt-3 flex items-center gap-1.5 text-xs text-[#1A1A1A]/55">
          <Clock className="size-3.5" />
          {stage.id === 'delivered'
            ? 'Delivered — your design and OpusPass tickets are ready.'
            : stage.id === 'payment_review'
              ? `Awaiting payment confirmation from the OpusFesta team${order.paymentRef ? ` — ref ${order.paymentRef}` : ''}.`
              : 'Being personalised — ready within 24 hours of payment.'}
        </p>
      </div>

      {/* Actions */}
      <div className="flex items-center justify-between gap-3 border-t border-black/[0.06] bg-black/[0.015] px-5 py-3">
        <div className="flex flex-wrap items-center gap-1">
          <span className={cn(META_PILL, GREEN_PILL)}>
            {itemCount} {itemCount === 1 ? 'design' : 'designs'}
          </span>
          {(order.paymentLabel?.split(' · ') ?? []).filter(Boolean).map((part) => (
            <span key={part} className={cn(META_PILL, GREEN_PILL)}>
              {part}
            </span>
          ))}
        </div>
        <Button variant="secondary" onClick={() => downloadInvoice(order)}>
          <Download className="size-4" /> Invoice
        </Button>
      </div>
    </Card>
  )
}

export default function OrdersManager() {
  const [orders, setOrders] = useState<StoredOrder[]>([])
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setOrders(getOrders())
    setMounted(true)
  }, [])

  useEffect(() => {
    if (!mounted || orders.length === 0) return
    let cancelled = false
    async function sync() {
      let changed = false
      for (const order of orders) {
        try {
          const res = await fetch(`/api/payments/status?ref=${encodeURIComponent(order.ref)}`, {
            cache: 'no-store',
          })
          if (!res.ok) continue
          const data = (await res.json()) as StatusResponse
          if (data.status !== 'paid' || order.paymentStatus === 'paid') continue
          setLastOrder({
            ...order,
            paidAt: data.paidAt ?? order.paidAt,
            paymentStatus: 'paid',
          })
          changed = true
        } catch {
          /* keep the local order snapshot if the status check fails */
        }
      }
      if (!cancelled && changed) setOrders(getOrders())
    }
    void sync()
    return () => {
      cancelled = true
    }
  }, [mounted, orders])

  const stats = useMemo(() => {
    const inProgress = orders.filter((o) => ORDER_STAGES[currentStageIndex(o)].id !== 'delivered').length
    const delivered = orders.length - inProgress
    return { total: orders.length, inProgress, delivered }
  }, [orders])

  return (
    <div className="space-y-8">
      <header className="border-b border-black/[0.06] pb-6">
        <h1 className="text-2xl font-bold tracking-tight text-[#1A1A1A] sm:text-3xl">Orders</h1>
        <p className="mt-2 text-sm text-[#1A1A1A]/65 sm:text-base">
          Track your invitation orders and download invoices.
        </p>
      </header>

      {!mounted ? null : orders.length === 0 ? (
        <EmptyState
          icon={<Receipt className="h-7 w-7" />}
          title="No orders yet"
          description="When you purchase an invitation design, your order and tracking will appear here."
          action={
            <Link href="/invitations/catalog">
              <Button>
                <ArrowRight className="h-4 w-4" /> Browse designs
              </Button>
            </Link>
          }
        />
      ) : (
        <>
          <div className="grid grid-cols-3 gap-4">
            <StatCard label="Total orders" value={stats.total} icon={<Package className="h-5 w-5" />} accent />
            <StatCard label="In progress" value={stats.inProgress} icon={<Clock className="h-5 w-5" />} />
            <StatCard label="Delivered" value={stats.delivered} icon={<Check className="h-5 w-5" />} />
          </div>

          <div className="space-y-4">
            {orders.map((order) => (
              <OrderCard key={order.ref} order={order} />
            ))}
          </div>
        </>
      )}
    </div>
  )
}
