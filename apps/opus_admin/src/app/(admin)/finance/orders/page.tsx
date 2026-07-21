import { redirect } from 'next/navigation'
import type { ReactNode } from 'react'
import { Mail, Package, Phone, Search, ReceiptText, Loader2, CheckCircle2, Truck } from 'lucide-react'
import Link from 'next/link'
import { cn } from '@/lib/utils'
import { HeaderActionsSlot } from '@/components/HeaderPortals'
import { getAdminAccessRole, hasPermission, isAdminDashboardRole } from '@/lib/admin-auth'
import OrdersHeading from './OrdersHeading'
import { updateFulfillmentStatus } from './actions'
import {
  getFulfillmentOrders,
  getFulfillmentSummary,
  ORDERS_PAGE_SIZE,
  type FulfillmentOrder,
  type FulfillmentStatus,
  type FulfillmentFilter,
} from './queries'

export const dynamic = 'force-dynamic'

const STATUS_LABEL: Record<FulfillmentStatus, string> = {
  not_started: 'Not started',
  in_progress: 'In progress',
  ready: 'Ready',
  delivered: 'Delivered',
}

const STATUS_CLASS: Record<FulfillmentStatus, string> = {
  not_started: 'border-gray-200 bg-gray-50 text-gray-600',
  in_progress: 'border-amber-200 bg-amber-50 text-amber-800',
  ready: 'border-[#C9A0DC]/40 bg-[#F0DFF6] text-[#7E5896]',
  delivered: 'border-emerald-200 bg-emerald-50 text-emerald-700',
}

const STATUS_ICON: Record<FulfillmentStatus, ReactNode> = {
  not_started: <Package className="h-3.5 w-3.5" />,
  in_progress: <Loader2 className="h-3.5 w-3.5" />,
  ready: <CheckCircle2 className="h-3.5 w-3.5" />,
  delivered: <Truck className="h-3.5 w-3.5" />,
}

function formatTzs(value: number): string {
  return `TZS ${value.toLocaleString('en-US')}`
}

function formatDate(iso: string | null): string {
  if (!iso) return '—'
  const date = new Date(iso)
  if (Number.isNaN(date.getTime())) return '—'
  return date
    .toLocaleString('en-GB', { day: '2-digit', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit', hour12: true })
    .replace(',', ' ·')
    .replace(/\b(am|pm)\b/i, (match) => match.toUpperCase())
}

function StatusBadge({ status }: { status: FulfillmentStatus }) {
  return (
    <span className={cn('inline-flex items-center gap-1 rounded-full border px-2.5 py-1 text-xs font-semibold', STATUS_CLASS[status])}>
      {STATUS_ICON[status]}
      {STATUS_LABEL[status]}
    </span>
  )
}

function Kpi({ label, value, href, active }: { label: string; value: string; href?: string; active?: boolean }) {
  const className = cn(
    'block rounded-2xl border bg-white p-4 shadow-[0_2px_10px_-4px_rgba(0,0,0,0.04)] transition-colors',
    active ? 'border-[#C9A0DC] ring-1 ring-[#C9A0DC]' : 'border-gray-100',
    href && 'hover:border-[#C9A0DC]',
  )
  const inner = (
    <>
      <p className="text-xs font-semibold uppercase tracking-wider text-gray-500">{label}</p>
      <p className="mt-2 text-2xl font-semibold tracking-tight text-gray-900">{value}</p>
    </>
  )
  return href ? (
    <Link href={href} className={className}>
      {inner}
    </Link>
  ) : (
    <div className={className}>{inner}</div>
  )
}

function Detail({ icon, label, value }: { icon: ReactNode; label: string; value: string }) {
  return (
    <div className="rounded-xl border border-gray-100 bg-gray-50/60 p-3">
      <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-gray-500">
        <span className="text-[#7E5896]">{icon}</span>
        {label}
      </div>
      <p className="mt-2 break-words text-sm font-semibold text-gray-900">{value}</p>
    </div>
  )
}

function ItemList({ order }: { order: FulfillmentOrder }) {
  if (order.items.length === 0) return <p className="text-sm text-gray-500">No line items captured.</p>
  return (
    <div className="divide-y divide-gray-100 rounded-xl border border-gray-100 bg-gray-50/60">
      {order.items.map((item, index) => (
        <div key={`${item.id ?? item.name ?? 'item'}-${index}`} className="flex items-center justify-between gap-4 px-3 py-2.5">
          <div className="flex min-w-0 items-center gap-3">
            {item.image ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img src={item.image} alt="" className="h-12 w-9 shrink-0 rounded object-cover ring-1 ring-gray-200" />
            ) : null}
            <p className="truncate text-sm font-semibold text-gray-900">{item.name ?? 'Order item'}</p>
          </div>
          {typeof item.total === 'number' && (
            <span className="shrink-0 text-sm font-semibold tabular-nums text-gray-900">{formatTzs(item.total)}</span>
          )}
        </div>
      ))}
    </div>
  )
}

function FulfillmentControl({ order, canWrite }: { order: FulfillmentOrder; canWrite: boolean }) {
  if (!canWrite) {
    return (
      <div className="rounded-xl border border-gray-100 bg-gray-50 p-3 text-xs text-gray-600">
        {order.fulfillmentUpdatedAt
          ? `Last updated ${formatDate(order.fulfillmentUpdatedAt)}${order.fulfillmentUpdatedBy ? ` by ${order.fulfillmentUpdatedBy}` : ''}`
          : 'Read-only — your account has no fulfilment write access.'}
      </div>
    )
  }
  const options: FulfillmentStatus[] = ['not_started', 'in_progress', 'ready', 'delivered']
  return (
    <form className="rounded-2xl border border-gray-200 bg-white p-4 shadow-[0_1px_2px_rgba(0,0,0,0.04)]">
      <input type="hidden" name="id" value={order.id} />
      <p className="text-xs font-bold uppercase tracking-wider text-gray-500">Design status</p>
      <div className="mt-2 grid grid-cols-2 gap-2">
        {options.map((opt) => (
          <button
            key={opt}
            type="submit"
            formAction={updateFulfillmentStatus.bind(null, opt)}
            disabled={order.fulfillmentStatus === opt}
            className={cn(
              'inline-flex items-center justify-center gap-1.5 rounded-xl border px-3 py-2 text-xs font-semibold transition disabled:cursor-default',
              order.fulfillmentStatus === opt
                ? 'border-[#7E5896] bg-[#7E5896] text-white'
                : 'border-gray-200 bg-white text-gray-600 hover:border-[#C9A0DC] hover:text-[#7E5896]',
            )}
          >
            {STATUS_ICON[opt]}
            {STATUS_LABEL[opt]}
          </button>
        ))}
      </div>
      {order.fulfillmentUpdatedAt ? (
        <p className="mt-3 text-xs text-gray-500">
          Last updated {formatDate(order.fulfillmentUpdatedAt)}
          {order.fulfillmentUpdatedBy ? ` by ${order.fulfillmentUpdatedBy}` : ''}
        </p>
      ) : null}
    </form>
  )
}

function OrderCard({ order, canWrite }: { order: FulfillmentOrder; canWrite: boolean }) {
  const open = order.fulfillmentStatus !== 'delivered'
  return (
    <details open={open} className="group rounded-2xl border border-gray-100 bg-white shadow-[0_2px_10px_-4px_rgba(0,0,0,0.04)]">
      <summary className="flex cursor-pointer list-none items-center justify-between gap-4 p-5 [&::-webkit-details-marker]:hidden">
        <div className="min-w-0">
          <div className="flex flex-wrap items-center gap-2">
            <h2 className="text-lg font-semibold text-gray-900">{order.ref}</h2>
            <StatusBadge status={order.fulfillmentStatus} />
            <span className="rounded-full border border-gray-200 bg-gray-50 px-2 py-0.5 text-[11px] font-medium text-gray-500">
              {order.paymentLabel || order.provider}
            </span>
          </div>
          <p className="mt-1.5 text-sm text-gray-500">Paid {formatDate(order.paidAt ?? order.createdAt)}</p>
        </div>
        <div className="text-right">
          <p className="text-xs font-semibold uppercase tracking-wider text-gray-500">Total</p>
          <p className="mt-1 text-xl font-semibold tabular-nums text-gray-900">{formatTzs(order.amountTotal)}</p>
        </div>
      </summary>

      <div className="grid items-start gap-5 px-5 pb-5 lg:grid-cols-[minmax(0,1fr)_minmax(280px,360px)]">
        <div className="space-y-4">
          <div className="grid gap-3 sm:grid-cols-2">
            <Detail icon={<Mail className="h-4 w-4" />} label="Customer" value={order.contactName || order.contactEmail} />
            <Detail icon={<Phone className="h-4 w-4" />} label="Phone" value={order.contactPhone || '—'} />
          </div>
          <ItemList order={order} />
        </div>
        <FulfillmentControl order={order} canWrite={canWrite} />
      </div>
    </details>
  )
}

const FILTER_TABS: { key: FulfillmentFilter; label: string }[] = [
  { key: 'all', label: 'All' },
  { key: 'not_started', label: 'Not started' },
  { key: 'in_progress', label: 'In progress' },
  { key: 'ready', label: 'Ready' },
  { key: 'delivered', label: 'Delivered' },
]

function filterHref(filter: FulfillmentFilter, q?: string): string {
  const params = new URLSearchParams()
  if (filter !== 'all') params.set('filter', filter)
  if (q) params.set('q', q)
  const qs = params.toString()
  return qs ? `/finance/orders?${qs}` : '/finance/orders'
}

export default async function FulfillmentOrdersPage({
  searchParams,
}: {
  searchParams: Promise<{ filter?: string; q?: string }>
}) {
  const role = await getAdminAccessRole()
  if (!isAdminDashboardRole(role)) redirect('/contribute')
  if (!(await hasPermission('finance.read'))) redirect('/')

  const sp = await searchParams
  const filter: FulfillmentFilter = (['not_started', 'in_progress', 'ready', 'delivered', 'all'] as const).includes(
    sp.filter as FulfillmentFilter,
  )
    ? (sp.filter as FulfillmentFilter)
    : 'all'
  const q = (sp.q ?? '').trim()

  const [summary, orders, canWrite] = await Promise.all([
    getFulfillmentSummary(),
    getFulfillmentOrders({ filter, q }),
    hasPermission('finance.write'),
  ])
  const capped = orders.length === ORDERS_PAGE_SIZE

  return (
    <div className="mx-auto max-w-[1400px] px-4 py-6 sm:px-6 sm:py-8 lg:px-8 lg:py-10">
      <OrdersHeading />
      {/* Payment approvals live on the sibling page; keep the route one click
          away now that the pointer is out of the in-page subtitle. */}
      <HeaderActionsSlot>
        <Link
          href="/finance/payments"
          className="inline-flex items-center gap-2 rounded-lg border border-gray-200 bg-white px-3.5 py-2 text-sm font-medium text-gray-700 transition-colors hover:bg-gray-50"
        >
          <ReceiptText className="h-4 w-4" />
          Invitation Payments
        </Link>
      </HeaderActionsSlot>

      <div className="mb-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <Kpi label="Not started" value={String(summary.notStarted)} href={filterHref('not_started', q)} active={filter === 'not_started'} />
        <Kpi label="In progress" value={String(summary.inProgress)} href={filterHref('in_progress', q)} active={filter === 'in_progress'} />
        <Kpi label="Ready" value={String(summary.ready)} href={filterHref('ready', q)} active={filter === 'ready'} />
        <Kpi label="Delivered" value={String(summary.delivered)} href={filterHref('delivered', q)} active={filter === 'delivered'} />
      </div>

      <div className="mb-5 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex flex-wrap gap-1.5">
          {FILTER_TABS.map((tab) => (
            <Link
              key={tab.key}
              href={filterHref(tab.key, q)}
              className={cn(
                'rounded-full px-3.5 py-1.5 text-sm font-medium transition-colors',
                filter === tab.key ? 'bg-[#7E5896] text-white' : 'border border-gray-200 bg-white text-gray-600 hover:bg-gray-50',
              )}
            >
              {tab.label}
            </Link>
          ))}
        </div>
        <form method="get" action="/finance/orders" className="flex items-center gap-2">
          {filter !== 'all' && <input type="hidden" name="filter" value={filter} />}
          <div className="relative">
            <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
            <input
              type="search"
              name="q"
              defaultValue={q}
              placeholder="Search ref, name, email…"
              className="w-full rounded-xl border border-gray-200 bg-white py-2 pl-9 pr-3 text-sm outline-none transition focus:border-[#7E5896] focus:ring-2 focus:ring-[#F0DFF6] sm:w-72"
            />
          </div>
          <button type="submit" className="rounded-xl bg-[#7E5896] px-4 py-2 text-sm font-semibold text-white transition hover:bg-[#6c4884]">
            Search
          </button>
        </form>
      </div>

      {orders.length === 0 ? (
        <div className="rounded-2xl border border-dashed border-gray-200 bg-white p-10 text-center">
          <ReceiptText className="mx-auto h-8 w-8 text-gray-300" />
          <h2 className="mt-3 text-sm font-semibold text-gray-900">
            {q || filter !== 'all' ? 'No orders match these filters' : 'No paid orders yet'}
          </h2>
        </div>
      ) : (
        <>
          <div className="space-y-4">
            {orders.map((order) => (
              <OrderCard key={order.id} order={order} canWrite={canWrite} />
            ))}
          </div>
          {capped && (
            <p className="mt-5 text-center text-xs text-gray-500">
              Showing the first {ORDERS_PAGE_SIZE}. Narrow with a filter or search to find a specific order.
            </p>
          )}
        </>
      )}
    </div>
  )
}
