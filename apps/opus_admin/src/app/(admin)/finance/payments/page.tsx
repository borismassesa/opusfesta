import { redirect } from 'next/navigation'
import type { ReactNode } from 'react'
import {
  AlertCircle,
  CheckCircle2,
  Clock,
  Mail,
  Phone,
  ReceiptText,
  Smartphone,
  XCircle,
} from 'lucide-react'
import { getAdminAccessRole, hasPermission, isAdminDashboardRole } from '@/lib/admin-auth'
import { approveInvitationPayment, rejectInvitationPayment } from './actions'
import { getInvitationPayments, type InvitationPayment, type InvitationPaymentStatus } from './queries'

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

function Kpi({ label, value, icon }: { label: string; value: string; icon: ReactNode }) {
  return (
    <div className="rounded-2xl border border-gray-100 bg-white p-4 shadow-[0_2px_10px_-4px_rgba(0,0,0,0.04)]">
      <div className="flex items-center justify-between gap-3">
        <p className="text-xs font-semibold uppercase tracking-wider text-gray-500">{label}</p>
        <span className="text-[#7E5896]">{icon}</span>
      </div>
      <p className="mt-2 text-2xl font-semibold tracking-tight text-gray-900">{value}</p>
    </div>
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
              <p className="mt-0.5 text-xs text-gray-500">
                {[item.tier, item.guests ? `${item.guests.toLocaleString('en-US')} guests` : null, item.summary]
                  .filter(Boolean)
                  .join(' · ')}
              </p>
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
    <form className="rounded-xl border border-gray-100 bg-gray-50 p-3">
      <input type="hidden" name="id" value={payment.id} />
      <label className="text-xs font-semibold uppercase tracking-wider text-gray-500" htmlFor={`note-${payment.id}`}>
        Review note
      </label>
      <textarea
        id={`note-${payment.id}`}
        name="note"
        rows={2}
        placeholder="Optional for approval; required for rejection."
        className="mt-2 w-full rounded-lg border border-gray-200 bg-white px-3 py-2 text-sm outline-none focus:border-[#7E5896] focus:ring-2 focus:ring-[#F0DFF6]"
      />
      <div className="mt-3 flex flex-wrap items-center justify-end gap-2">
        <button
          type="submit"
          formAction={rejectInvitationPayment}
          className="inline-flex items-center gap-1.5 rounded-lg border border-rose-200 bg-white px-3 py-2 text-sm font-semibold text-rose-700 hover:bg-rose-50"
        >
          <XCircle className="h-4 w-4" />
          Reject
        </button>
        <button
          type="submit"
          formAction={approveInvitationPayment}
          className="inline-flex items-center gap-1.5 rounded-lg bg-[#7E5896] px-3 py-2 text-sm font-semibold text-white hover:bg-[#6c4884]"
        >
          <CheckCircle2 className="h-4 w-4" />
          Approve payment
        </button>
      </div>
    </form>
  )
}

function PaymentCard({ payment, canWrite }: { payment: InvitationPayment; canWrite: boolean }) {
  return (
    <article className="rounded-2xl border border-gray-100 bg-white p-5 shadow-[0_2px_10px_-4px_rgba(0,0,0,0.04)]">
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <div className="flex flex-wrap items-center gap-2">
            <h2 className="text-lg font-semibold text-gray-900">{payment.ref}</h2>
            <StatusBadge status={payment.status} />
          </div>
          <p className="mt-1 text-sm text-gray-500">
            Submitted {formatDate(payment.paymentSubmittedAt ?? payment.createdAt)}
          </p>
        </div>
        <div className="text-right">
          <p className="text-xs font-semibold uppercase tracking-wider text-gray-500">Invoice total</p>
          <p className="mt-1 text-xl font-semibold tabular-nums text-gray-900">{formatTzs(payment.amountTotal)}</p>
        </div>
      </div>

      <div className="mt-5 grid gap-5 lg:grid-cols-[minmax(0,1fr)_minmax(280px,360px)]">
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
    </article>
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

export default async function InvitationPaymentsPage() {
  const role = await getAdminAccessRole()
  if (!isAdminDashboardRole(role)) redirect('/contribute')
  if (!(await hasPermission('finance.read'))) redirect('/')

  const payments = await getInvitationPayments()
  const canWrite = await hasPermission('finance.write')
  const needsReview = payments.filter((payment) => payment.status === 'processing' || payment.status === 'pending')
  const approved = payments.filter((payment) => payment.status === 'paid')
  const rejected = payments.filter((payment) => payment.status === 'failed')
  const reviewValue = needsReview.reduce((sum, payment) => sum + payment.amountTotal, 0)

  return (
    <div className="mx-auto max-w-[1400px] px-4 py-6 sm:px-6 sm:py-8 lg:px-8 lg:py-10">
      <header className="mb-6 flex flex-wrap items-end justify-between gap-4">
        <div>
          <p className="text-xs font-bold uppercase tracking-wider text-[#7E5896]">Finance</p>
          <h1 className="mt-1 text-2xl font-semibold tracking-tight text-gray-900">Invitation Payments</h1>
          <p className="mt-2 max-w-2xl text-sm text-gray-600">
            Review manual M-Pesa / Lipa Namba payments submitted by invitation customers.
          </p>
        </div>
      </header>

      <div className="mb-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <Kpi label="Needs review" value={String(needsReview.length)} icon={<AlertCircle className="h-4 w-4" />} />
        <Kpi label="Review value" value={compactTzs(reviewValue)} icon={<Clock className="h-4 w-4" />} />
        <Kpi label="Approved" value={String(approved.length)} icon={<CheckCircle2 className="h-4 w-4" />} />
        <Kpi label="Rejected" value={String(rejected.length)} icon={<XCircle className="h-4 w-4" />} />
      </div>

      {payments.length === 0 ? (
        <div className="rounded-2xl border border-dashed border-gray-200 bg-white p-10 text-center">
          <ReceiptText className="mx-auto h-8 w-8 text-gray-300" />
          <h2 className="mt-3 text-sm font-semibold text-gray-900">No invitation payments yet</h2>
          <p className="mt-1 text-sm text-gray-500">
            Manual Lipa Namba submissions from checkout will appear here for approval.
          </p>
        </div>
      ) : (
        <div className="space-y-4">
          {payments.map((payment) => (
            <PaymentCard key={payment.id} payment={payment} canWrite={canWrite} />
          ))}
        </div>
      )}
    </div>
  )
}
