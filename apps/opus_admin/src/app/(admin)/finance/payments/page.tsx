import { redirect } from 'next/navigation'
import type { ReactNode } from 'react'
import {
  AlertCircle,
  CheckCircle2,
  ChevronDown,
  Clock,
  Mail,
  Phone,
  ReceiptText,
  Search,
  Smartphone,
  XCircle,
} from 'lucide-react'
import Link from 'next/link'
import { cn } from '@/lib/utils'
import { getAdminAccessRole, hasPermission, isAdminDashboardRole } from '@/lib/admin-auth'
import { approveInvitationPayment, rejectInvitationPayment } from './actions'
import {
  getInvitationPayments,
  getInvitationPaymentSummary,
  PAYMENTS_PAGE_SIZE,
  type InvitationPayment,
  type InvitationPaymentStatus,
  type PaymentFilter,
} from './queries'
import PaymentsHeading from './PaymentsHeading'

export const dynamic = 'force-dynamic'

const STATUS_LABEL: Record<InvitationPaymentStatus, string> = {
  pending: 'Pending',
  processing: 'Needs review',
  paid: 'Approved',
  failed: 'Rejected',
  expired: 'Expired',
  refunded: 'Refunded',
}

const STATUS_CLASS: Record<InvitationPaymentStatus, string> = {
  pending: 'border-amber-200 bg-amber-50 text-amber-800',
  processing: 'border-amber-200 bg-amber-50 text-amber-800',
  paid: 'border-emerald-200 bg-emerald-50 text-emerald-700',
  failed: 'border-rose-200 bg-rose-50 text-rose-700',
  expired: 'border-gray-200 bg-gray-50 text-gray-600',
  refunded: 'border-blue-200 bg-blue-50 text-blue-700',
}

function formatTzs(value: number): string {
  return `TZS ${value.toLocaleString('en-US')}`
}

function formatDate(iso: string | null): string {
  if (!iso) return '—'
  const date = new Date(iso)
  if (Number.isNaN(date.getTime())) return '—'
  return date
    .toLocaleString('en-GB', {
      day: '2-digit',
      month: 'short',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
      hour12: true,
    })
    .replace(',', ' ·')
    .replace(/\b(am|pm)\b/i, (match) => match.toUpperCase())
}

// Date + time split into parts so the submitted line can render them cleanly
// (icon + "date at time") without a dot separator.
function dateTimeParts(iso: string | null): { date: string; time: string } | null {
  if (!iso) return null
  const d = new Date(iso)
  if (Number.isNaN(d.getTime())) return null
  return {
    date: d.toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' }),
    time: d
      .toLocaleTimeString('en-GB', { hour: '2-digit', minute: '2-digit', hour12: true })
      .replace(/\b(am|pm)\b/i, (m) => m.toUpperCase()),
  }
}

function compactTzs(value: number): string {
  if (value >= 1_000_000) return `TZS ${(value / 1_000_000).toFixed(1)}M`
  if (value >= 1_000) return `TZS ${(value / 1_000).toFixed(0)}K`
  return formatTzs(value)
}

function StatusBadge({ status }: { status: InvitationPaymentStatus }) {
  return (
    <span className={`inline-flex items-center rounded-full border px-2.5 py-1 text-xs font-semibold ${STATUS_CLASS[status]}`}>
      {STATUS_LABEL[status]}
    </span>
  )
}

function Kpi({
  label,
  value,
  icon,
  href,
  active,
}: {
  label: string
  value: string
  icon: ReactNode
  href?: string
  active?: boolean
}) {
  const className = cn(
    'block rounded-2xl border bg-white p-4 shadow-[0_2px_10px_-4px_rgba(0,0,0,0.04)] transition-colors',
    active ? 'border-[#C9A0DC] ring-1 ring-[#C9A0DC]' : 'border-gray-100',
    href && 'hover:border-[#C9A0DC]',
  )
  const inner = (
    <>
      <div className="flex items-center justify-between gap-3">
        <p className="text-xs font-semibold uppercase tracking-wider text-gray-500">{label}</p>
        <span className="text-[#7E5896]">{icon}</span>
      </div>
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

function ItemList({ payment }: { payment: InvitationPayment }) {
  if (payment.items.length === 0) return <p className="text-sm text-gray-500">No line items captured.</p>
  return (
    <div className="divide-y divide-gray-100 rounded-xl border border-gray-100 bg-gray-50/60">
      {payment.items.map((item, index) => (
        <div key={`${item.id ?? item.name ?? 'item'}-${index}`} className="flex items-start justify-between gap-4 px-3 py-2.5">
          <div className="flex min-w-0 items-center gap-3">
            {item.image ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                src={item.image}
                alt=""
                className="h-12 w-9 shrink-0 rounded object-cover ring-1 ring-gray-200"
              />
            ) : null}
            <div className="min-w-0">
              <p className="truncate text-sm font-semibold text-gray-900">{item.name ?? 'Invitation design'}</p>
              {(() => {
                // The summary already contains tier · guests · add-ons, so use it
                // as the single source (avoids the tier/guests duplication) and
                // render each part as a pill instead of dot-separated text.
                const parts = item.summary
                  ? item.summary.split('·').map((s) => s.trim()).filter(Boolean)
                  : ([item.tier, item.guests != null ? `${item.guests.toLocaleString('en-US')} guests` : null].filter(Boolean) as string[])
                return parts.length ? (
                  <div className="mt-1 flex flex-wrap gap-1">
                    {parts.map((part, i) => (
                      <span
                        key={i}
                        className="inline-flex items-center rounded-full bg-[#9FE870]/25 px-2 py-0.5 text-[11px] font-medium text-[#3f6b1f]"
                      >
                        {part}
                      </span>
                    ))}
                  </div>
                ) : null
              })()}
            </div>
          </div>
          {typeof item.total === 'number' && (
            <span className="shrink-0 text-sm font-semibold tabular-nums text-gray-900">
              {formatTzs(item.total)}
            </span>
          )}
        </div>
      ))}
    </div>
  )
}

function ReviewForm({ payment, canWrite }: { payment: InvitationPayment; canWrite: boolean }) {
  const actionable = payment.status === 'processing' || payment.status === 'pending'
  if (actionable && !canWrite) {
    return (
      <div className="rounded-xl border border-amber-100 bg-amber-50 p-3 text-xs leading-relaxed text-amber-800">
        This payment needs review. Your account has finance read access, but not approval access.
      </div>
    )
  }
  if (!actionable) {
    return (
      <div className="rounded-xl border border-gray-100 bg-gray-50 p-3 text-xs text-gray-600">
        Reviewed {formatDate(payment.reviewedAt)}
        {payment.reviewedBy ? ` by ${payment.reviewedBy}` : ''}
        {payment.reviewNote ? ` · ${payment.reviewNote}` : ''}
      </div>
    )
  }
  return (
    <form className="rounded-2xl border border-gray-200 bg-white p-4 shadow-[0_1px_2px_rgba(0,0,0,0.04)]">
      <input type="hidden" name="id" value={payment.id} />
      <label
        className="text-xs font-bold uppercase tracking-wider text-gray-500"
        htmlFor={`note-${payment.id}`}
      >
        Review note
      </label>
      <textarea
        id={`note-${payment.id}`}
        name="note"
        rows={3}
        placeholder="Add a note for the customer or finance record…"
        className="mt-2 w-full resize-none rounded-xl border border-gray-200 bg-gray-50/60 px-3.5 py-2.5 text-sm text-gray-900 outline-none transition placeholder:text-gray-400 focus:border-[#7E5896] focus:bg-white focus:ring-2 focus:ring-[#F0DFF6]"
      />
      <div className="mt-4 grid grid-cols-2 gap-3 sm:flex sm:justify-end">
        <button
          type="submit"
          formAction={approveInvitationPayment}
          className="inline-flex items-center justify-center gap-1.5 rounded-xl bg-[#7E5896] px-5 py-2.5 text-sm font-semibold text-white shadow-sm transition hover:bg-[#6c4884]"
        >
          <CheckCircle2 className="h-4 w-4" />
          Approve payment
        </button>
        <button
          type="submit"
          formAction={rejectInvitationPayment}
          className="inline-flex items-center justify-center gap-1.5 rounded-xl border border-rose-200 bg-white px-5 py-2.5 text-sm font-semibold text-rose-600 transition hover:border-rose-300 hover:bg-rose-50"
        >
          <XCircle className="h-4 w-4" />
          Reject
        </button>
      </div>
    </form>
  )
}

function PaymentCard({ payment, canWrite }: { payment: InvitationPayment; canWrite: boolean }) {
  // Expanded by default while it still needs review; collapsed once reviewed so
  // the queue stays scannable. Native <details> — no client JS needed.
  const open = payment.status === 'processing' || payment.status === 'pending'
  return (
    <details
      open={open}
      className="group rounded-2xl border border-gray-100 bg-white shadow-[0_2px_10px_-4px_rgba(0,0,0,0.04)]"
    >
      <summary className="flex cursor-pointer list-none items-center justify-between gap-4 p-5 [&::-webkit-details-marker]:hidden">
        <div className="min-w-0">
          <div className="flex flex-wrap items-center gap-2">
            <h2 className="text-lg font-semibold text-gray-900">{payment.ref}</h2>
            <StatusBadge status={payment.status} />
          </div>
          {(() => {
            const t = dateTimeParts(payment.paymentSubmittedAt ?? payment.createdAt)
            return (
              <p className="mt-1.5 inline-flex items-center gap-1.5 text-sm text-gray-500">
                <Clock className="h-3.5 w-3.5 shrink-0 text-gray-400" aria-hidden />
                {t ? (
                  <span>
                    Submitted {t.date} <span className="text-gray-400">at</span> {t.time}
                  </span>
                ) : (
                  <span>Submitted —</span>
                )}
              </p>
            )
          })()}
        </div>
        <div className="flex shrink-0 items-center gap-4 sm:gap-6">
          <div className="text-right">
            <p className="text-xs font-semibold uppercase tracking-wider text-gray-500">Invoice total</p>
            <p className="mt-1 text-xl font-semibold tabular-nums text-gray-900">{formatTzs(payment.amountTotal)}</p>
          </div>
          {/* Divider keeps the total and the toggle visually distinct */}
          <span aria-hidden className="h-10 w-px shrink-0 bg-gray-200" />
          {/* Collapse toggle — pinned to the right, clearly interactive */}
          <span
            aria-hidden
            className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full border border-gray-200 bg-white text-gray-500 transition-colors group-hover:border-[#C9A0DC] group-hover:text-[#7E5896] group-open:bg-[#F0DFF6] group-open:text-[#7E5896]"
          >
            <ChevronDown className="h-5 w-5 transition-transform group-open:rotate-180" />
          </span>
        </div>
      </summary>

      <div className="grid items-start gap-5 px-5 pb-5 lg:grid-cols-[minmax(0,1fr)_minmax(280px,360px)]">
        <div className="space-y-4">
          <div className="grid gap-3 sm:grid-cols-2">
            <Detail icon={<Mail className="h-4 w-4" />} label="Customer" value={payment.contactName || payment.contactEmail} meta={payment.contactEmail} />
            <Detail icon={<Phone className="h-4 w-4" />} label="Contact phone" value={payment.contactPhone} />
            <Detail icon={<Smartphone className="h-4 w-4" />} label="Payer account" value={payment.payerName || '—'} meta={payment.payerPhone || undefined} />
            <Detail icon={<ReceiptText className="h-4 w-4" />} label="Reference" value={payment.paymentReference || '—'} meta="Lipa Namba 350298654" />
          </div>
          <ItemList payment={payment} />
        </div>
        <ReviewForm payment={payment} canWrite={canWrite} />
      </div>
    </details>
  )
}

function Detail({
  icon,
  label,
  value,
  meta,
}: {
  icon: ReactNode
  label: string
  value: string
  meta?: string
}) {
  return (
    <div className="rounded-xl border border-gray-100 bg-gray-50/60 p-3">
      <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-gray-500">
        <span className="text-[#7E5896]">{icon}</span>
        {label}
      </div>
      <p className="mt-2 break-words text-sm font-semibold text-gray-900">{value}</p>
      {meta && <p className="mt-1 break-words text-xs text-gray-500">{meta}</p>}
    </div>
  )
}

const FILTER_TABS: { key: PaymentFilter; label: string }[] = [
  { key: 'all', label: 'All' },
  { key: 'review', label: 'Needs review' },
  { key: 'paid', label: 'Approved' },
  { key: 'failed', label: 'Rejected' },
]

function filterHref(filter: PaymentFilter, q?: string): string {
  const params = new URLSearchParams()
  if (filter !== 'all') params.set('filter', filter)
  if (q) params.set('q', q)
  const qs = params.toString()
  return qs ? `/finance/payments?${qs}` : '/finance/payments'
}

export default async function InvitationPaymentsPage({
  searchParams,
}: {
  searchParams: Promise<{ filter?: string; q?: string }>
}) {
  const role = await getAdminAccessRole()
  if (!isAdminDashboardRole(role)) redirect('/contribute')
  if (!(await hasPermission('finance.read'))) redirect('/')

  const sp = await searchParams
  const filter: PaymentFilter = (['review', 'paid', 'failed', 'all'] as const).includes(
    sp.filter as PaymentFilter,
  )
    ? (sp.filter as PaymentFilter)
    : 'all'
  const q = (sp.q ?? '').trim()

  const [summary, payments, canWrite] = await Promise.all([
    getInvitationPaymentSummary(),
    getInvitationPayments({ filter, q }),
    hasPermission('finance.write'),
  ])
  const capped = payments.length === PAYMENTS_PAGE_SIZE

  return (
    <div className="mx-auto max-w-[1400px] px-4 py-6 sm:px-6 sm:py-8 lg:px-8 lg:py-10">
      <PaymentsHeading />

      <div className="mb-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <Kpi label="Needs review" value={String(summary.review)} icon={<AlertCircle className="h-4 w-4" />} href={filterHref('review', q)} active={filter === 'review'} />
        <Kpi label="Review value" value={compactTzs(summary.reviewValue)} icon={<Clock className="h-4 w-4" />} />
        <Kpi label="Approved" value={String(summary.paid)} icon={<CheckCircle2 className="h-4 w-4" />} href={filterHref('paid', q)} active={filter === 'paid'} />
        <Kpi label="Rejected" value={String(summary.failed)} icon={<XCircle className="h-4 w-4" />} href={filterHref('failed', q)} active={filter === 'failed'} />
      </div>

      {/* Filter tabs + search — scale to thousands of payments */}
      <div className="mb-5 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex flex-wrap gap-1.5">
          {FILTER_TABS.map((tab) => (
            <Link
              key={tab.key}
              href={filterHref(tab.key, q)}
              className={cn(
                'rounded-full px-3.5 py-1.5 text-sm font-medium transition-colors',
                filter === tab.key
                  ? 'bg-[#7E5896] text-white'
                  : 'border border-gray-200 bg-white text-gray-600 hover:bg-gray-50',
              )}
            >
              {tab.label}
            </Link>
          ))}
        </div>
        <form method="get" action="/finance/payments" className="flex items-center gap-2">
          {filter !== 'all' && <input type="hidden" name="filter" value={filter} />}
          <div className="relative">
            <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
            <input
              type="search"
              name="q"
              defaultValue={q}
              placeholder="Search ref, name, email, reference…"
              className="w-full rounded-xl border border-gray-200 bg-white py-2 pl-9 pr-3 text-sm outline-none transition focus:border-[#7E5896] focus:ring-2 focus:ring-[#F0DFF6] sm:w-72"
            />
          </div>
          <button
            type="submit"
            className="rounded-xl bg-[#7E5896] px-4 py-2 text-sm font-semibold text-white transition hover:bg-[#6c4884]"
          >
            Search
          </button>
        </form>
      </div>

      {payments.length === 0 ? (
        <div className="rounded-2xl border border-dashed border-gray-200 bg-white p-10 text-center">
          <ReceiptText className="mx-auto h-8 w-8 text-gray-300" />
          <h2 className="mt-3 text-sm font-semibold text-gray-900">
            {q || filter !== 'all' ? 'No payments match these filters' : 'No invitation payments yet'}
          </h2>
          <p className="mt-1 text-sm text-gray-500">
            {q || filter !== 'all' ? (
              <Link href="/finance/payments" className="text-[#7E5896] underline">
                Clear filters
              </Link>
            ) : (
              'Manual Lipa Namba submissions from checkout will appear here for approval.'
            )}
          </p>
        </div>
      ) : (
        <>
          <div className="space-y-4">
            {payments.map((payment) => (
              <PaymentCard key={payment.id} payment={payment} canWrite={canWrite} />
            ))}
          </div>
          {capped && (
            <p className="mt-5 text-center text-xs text-gray-500">
              Showing the first {PAYMENTS_PAGE_SIZE}. Narrow with a filter or search to find a specific payment.
            </p>
          )}
        </>
      )}
    </div>
  )
}
