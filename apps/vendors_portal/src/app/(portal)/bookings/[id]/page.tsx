'use client'

import { use, useMemo } from 'react'
import Link from 'next/link'
import { notFound } from 'next/navigation'
import {
  ArrowLeft,
  CalendarClock,
  CalendarX,
  CheckCircle2,
  Circle,
  Download,
  ExternalLink,
  FileSignature,
  FileText,
  Mail,
  MessageSquare,
  Phone,
  RefreshCcw,
  Send,
  Sparkles,
  Timer,
  Wallet,
} from 'lucide-react'
import { bookings, type Booking, type BookingTimelineEntry } from '@/lib/mock-data'
import {
  STAGE_META,
  balanceAmount,
  depositAmount,
  durationUntil,
  eventDateLabel,
  formatTZS,
  relativeDays,
  timeAgo,
} from '@/lib/bookings'
import { cn } from '@/lib/utils'

export default function BookingDetailPage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const { id } = use(params)
  const booking = bookings.find((b) => b.id === id)
  if (!booking) notFound()

  return <BookingDetail booking={booking} />
}

function BookingDetail({ booking }: { booking: Booking }) {
  const stage = STAGE_META[booking.stage]
  const deposit = depositAmount(booking)
  const balance = balanceAmount(booking)

  // Pick the single most useful CTA for the current state.
  const primaryAction = useMemo(() => primaryCta(booking), [booking])

  return (
    <div className="px-8 pt-5 pb-12">
      <div className="space-y-5">
        <Link
          href="/bookings"
          className="inline-flex items-center gap-1.5 text-xs font-semibold text-gray-500 hover:text-gray-900 transition-colors"
        >
          <ArrowLeft className="w-3.5 h-3.5" />
          Back to pipeline
        </Link>

        {/* Stage banner */}
        <section className="bg-white rounded-2xl border border-gray-100 shadow-[0_2px_10px_-4px_rgba(0,0,0,0.05)] p-5 lg:p-6 flex flex-wrap items-center gap-4">
          <div className="flex items-center gap-3 min-w-0">
            <span
              className={cn(
                'inline-flex items-center gap-1.5 text-[11px] font-bold uppercase tracking-wider px-2.5 py-1 rounded-md border',
                stage.pillClass,
              )}
            >
              {stage.label}
            </span>
            <span className="text-sm text-gray-500 inline-flex items-center gap-1.5">
              <CalendarClock className="w-4 h-4 text-gray-400" />
              {eventDateLabel(booking.date)} · {booking.startTime}–{booking.endTime}
            </span>
            <span className="text-sm font-semibold text-gray-900">
              {relativeDays(booking.date)}
            </span>
          </div>

          {booking.stage === 'reserved' && booking.slotHeldUntil ? (
            <span className="inline-flex items-center gap-1.5 text-[11px] font-bold uppercase tracking-wider px-2.5 py-1 rounded-md border bg-rose-50 text-rose-700 border-rose-200">
              <Timer className="w-3 h-3" />
              Slot expires in {durationUntil(booking.slotHeldUntil)}
            </span>
          ) : null}

          <div className="ml-auto flex items-center gap-2">
            {primaryAction ? (
              <button
                type="button"
                className="inline-flex items-center gap-1.5 bg-gray-900 text-white text-sm font-semibold px-4 py-2 rounded-full hover:bg-gray-800 transition-colors"
              >
                <primaryAction.icon className="w-4 h-4" />
                {primaryAction.label}
              </button>
            ) : null}
          </div>
        </section>

        <div className="grid lg:grid-cols-[1fr_320px] gap-6 items-start">
          {/* Main column */}
          <div className="space-y-5">
            <Summary booking={booking} deposit={deposit} balance={balance} />
            <Timeline entries={booking.timeline} />
            <Payments booking={booking} deposit={deposit} balance={balance} />
            {booking.lastMessageAt ? <MessagesCard booking={booking} /> : null}
          </div>

          {/* Sidebar */}
          <aside className="space-y-5 lg:sticky lg:top-4">
            <CoupleCard booking={booking} />
            <DocumentsCard booking={booking} />
            <QuickActions booking={booking} />
          </aside>
        </div>
      </div>
    </div>
  )
}

/* ---------- Helpers ---------- */

type Cta = {
  label: string
  icon: typeof Send
  hint?: string
}

function primaryCta(b: Booking): Cta | null {
  if (b.stage === 'quoted') {
    return { label: 'Mark quote accepted', icon: CheckCircle2 }
  }
  if (b.stage === 'reserved' && !b.contractSigned) {
    return { label: 'Send contract', icon: FileSignature }
  }
  if (b.stage === 'reserved' && b.contractSigned && !b.depositPaid) {
    return { label: 'Mark deposit received', icon: Wallet }
  }
  if (b.stage === 'reserved') {
    return { label: 'Confirm booking', icon: CheckCircle2 }
  }
  if (b.stage === 'confirmed' && !b.briefSubmitted) {
    return { label: 'Open day-of brief', icon: FileText }
  }
  if (b.stage === 'completed' && !b.reviewRequested) {
    return { label: 'Request review', icon: Send }
  }
  return null
}

/* ---------- Summary ---------- */

function Summary({
  booking: b,
  deposit,
  balance,
}: {
  booking: Booking
  deposit: number
  balance: number
}) {
  return (
    <section className="bg-white rounded-2xl border border-gray-100 shadow-[0_2px_10px_-4px_rgba(0,0,0,0.05)] p-5 lg:p-6">
      <p className="text-[11px] font-bold uppercase tracking-[0.14em] text-gray-500 mb-4">
        Summary
      </p>
      <dl className="grid sm:grid-cols-2 gap-x-6 gap-y-4">
        <Field label="Package">
          <span className="text-sm font-semibold text-gray-900">{b.packageName}</span>
        </Field>
        <Field label="Total value">
          <span className="text-sm font-semibold text-gray-900 tabular-nums">
            {formatTZS(b.totalValue)}
          </span>
        </Field>
        <Field label="Venue">
          <span className="text-sm text-gray-900">{b.location}</span>
        </Field>
        <Field label="Hours">
          <span className="text-sm text-gray-900 tabular-nums">
            {b.startTime} – {b.endTime}
          </span>
        </Field>
        <Field label={`Deposit (${b.depositPercent}%)`}>
          <span
            className={cn(
              'text-sm font-semibold tabular-nums',
              b.depositPaid ? 'text-emerald-700' : 'text-amber-700',
            )}
          >
            {formatTZS(deposit)}
            <span className="ml-1.5 text-[10px] font-bold uppercase tracking-wider">
              {b.depositPaid ? 'Paid' : 'Pending'}
            </span>
          </span>
        </Field>
        <Field label="Balance">
          <span className="text-sm text-gray-900 tabular-nums">
            {formatTZS(balance)}
            {b.balanceDueDate ? (
              <span className="ml-1.5 text-[10px] text-gray-500">
                due {eventDateLabel(b.balanceDueDate)}
              </span>
            ) : null}
          </span>
        </Field>
      </dl>
    </section>
  )
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div>
      <dt className="text-[10px] font-bold uppercase tracking-wider text-gray-400">{label}</dt>
      <dd className="mt-1">{children}</dd>
    </div>
  )
}

/* ---------- Timeline ---------- */

const TIMELINE_ICON = {
  inquiry: Sparkles,
  quote_sent: Send,
  quote_accepted: CheckCircle2,
  contract_sent: FileSignature,
  contract_signed: FileSignature,
  deposit_paid: Wallet,
  confirmed: CheckCircle2,
  message: MessageSquare,
  reschedule_requested: RefreshCcw,
  rescheduled: RefreshCcw,
  completed: CheckCircle2,
  cancelled: CalendarX,
  review_requested: Send,
  review_received: Sparkles,
} satisfies Record<BookingTimelineEntry['kind'], typeof Sparkles>

function Timeline({ entries }: { entries: BookingTimelineEntry[] }) {
  const sorted = [...entries].sort(
    (a, b) => new Date(a.at).getTime() - new Date(b.at).getTime(),
  )
  return (
    <section className="bg-white rounded-2xl border border-gray-100 shadow-[0_2px_10px_-4px_rgba(0,0,0,0.05)] p-5 lg:p-6">
      <p className="text-[11px] font-bold uppercase tracking-[0.14em] text-gray-500 mb-4">
        Timeline
      </p>
      <ol className="relative pl-5">
        <span
          className="absolute left-[7px] top-1 bottom-1 w-px bg-gray-200"
          aria-hidden
        />
        {sorted.map((e) => {
          const Icon = TIMELINE_ICON[e.kind]
          return (
            <li key={`${e.at}-${e.kind}`} className="relative pl-5 pb-4 last:pb-0">
              <span className="absolute -left-0 top-0.5 w-4 h-4 rounded-full bg-white border border-gray-200 flex items-center justify-center">
                <Icon className="w-2.5 h-2.5 text-gray-500" />
              </span>
              <p className="text-sm text-gray-900 leading-snug">{e.label}</p>
              <p className="text-[11px] text-gray-400 mt-0.5">{timeAgo(e.at)}</p>
            </li>
          )
        })}
      </ol>
    </section>
  )
}

/* ---------- Payments ---------- */

function Payments({
  booking: b,
  deposit,
  balance,
}: {
  booking: Booking
  deposit: number
  balance: number
}) {
  return (
    <section className="bg-white rounded-2xl border border-gray-100 shadow-[0_2px_10px_-4px_rgba(0,0,0,0.05)] p-5 lg:p-6">
      <div className="flex items-center justify-between mb-4">
        <p className="text-[11px] font-bold uppercase tracking-[0.14em] text-gray-500">
          Payments
        </p>
        <span className="text-xs text-gray-400">
          Total {formatTZS(b.totalValue)}
        </span>
      </div>
      <ul className="divide-y divide-gray-100">
        <PaymentRow
          label={`Deposit (${b.depositPercent}%)`}
          amount={deposit}
          status={b.depositPaid ? 'paid' : 'pending'}
          hint={
            b.depositPaid
              ? 'Received'
              : b.contractSigned
                ? 'Awaiting transfer'
                : 'Sent with contract'
          }
        />
        <PaymentRow
          label="Balance"
          amount={balance}
          status={
            b.stage === 'completed' || (b.depositPaid && balance === 0)
              ? 'paid'
              : b.balanceDueDate
                ? 'scheduled'
                : 'pending'
          }
          hint={b.balanceDueDate ? `Due ${eventDateLabel(b.balanceDueDate)}` : 'Not yet scheduled'}
        />
      </ul>
    </section>
  )
}

function PaymentRow({
  label,
  amount,
  status,
  hint,
}: {
  label: string
  amount: number
  status: 'paid' | 'pending' | 'scheduled'
  hint: string
}) {
  const tone =
    status === 'paid'
      ? { chip: 'bg-emerald-50 text-emerald-700', text: 'Paid' }
      : status === 'scheduled'
        ? { chip: 'bg-gray-100 text-gray-700', text: 'Scheduled' }
        : { chip: 'bg-amber-50 text-amber-700', text: 'Pending' }
  return (
    <li className="flex items-center justify-between gap-4 py-3 first:pt-0 last:pb-0">
      <div className="min-w-0">
        <p className="text-sm font-semibold text-gray-900">{label}</p>
        <p className="text-xs text-gray-500 mt-0.5 truncate">{hint}</p>
      </div>
      <div className="text-right shrink-0">
        <p className="text-sm font-semibold text-gray-900 tabular-nums">{formatTZS(amount)}</p>
        <span
          className={cn(
            'inline-flex text-[10px] font-bold uppercase tracking-wider px-1.5 py-0.5 rounded-md mt-1',
            tone.chip,
          )}
        >
          {tone.text}
        </span>
      </div>
    </li>
  )
}

/* ---------- Messages ---------- */

function MessagesCard({ booking: b }: { booking: Booking }) {
  return (
    <section className="bg-white rounded-2xl border border-gray-100 shadow-[0_2px_10px_-4px_rgba(0,0,0,0.05)] p-5 lg:p-6">
      <div className="flex items-center justify-between mb-3">
        <p className="text-[11px] font-bold uppercase tracking-[0.14em] text-gray-500">
          Latest message
        </p>
        {b.leadId ? (
          <Link
            href={`/leads/${b.leadId}`}
            className="text-xs font-semibold text-gray-700 hover:text-gray-900 inline-flex items-center gap-1"
          >
            Open thread
            <ExternalLink className="w-3 h-3" />
          </Link>
        ) : null}
      </div>
      <div className="rounded-xl bg-gray-50 px-4 py-3.5">
        <p className="text-sm text-gray-900 leading-snug">{b.lastMessagePreview}</p>
        <p className="text-[10px] text-gray-500 mt-1.5">
          From {b.couple} · {b.lastMessageAt ? timeAgo(b.lastMessageAt) : ''}
        </p>
      </div>
    </section>
  )
}

/* ---------- Couple card ---------- */

function CoupleCard({ booking: b }: { booking: Booking }) {
  const initials = (b.couple.match(/[A-Z]/g) ?? []).slice(0, 2).join('') || 'C'
  return (
    <section className="bg-white rounded-2xl border border-gray-100 shadow-[0_2px_10px_-4px_rgba(0,0,0,0.05)] p-5">
      <div className="flex items-center gap-3 mb-3">
        <span
          className="w-12 h-12 rounded-full bg-cover bg-center bg-gray-200 ring-1 ring-white shadow-sm shrink-0"
          style={{ backgroundImage: b.avatarUrl ? `url(${b.avatarUrl})` : undefined }}
          aria-hidden
        >
          {!b.avatarUrl ? (
            <span className="w-full h-full flex items-center justify-center text-sm font-bold text-gray-600">
              {initials}
            </span>
          ) : null}
        </span>
        <div className="min-w-0">
          <p className="text-sm font-semibold text-gray-900 truncate">{b.couple}</p>
          <p className="text-xs text-gray-500 truncate">
            {b.partnerA} · {b.partnerB}
          </p>
        </div>
      </div>

      <ul className="space-y-1.5">
        <ContactLink href={`tel:${b.phone.replace(/\s/g, '')}`} icon={Phone}>
          {b.phone}
        </ContactLink>
        <ContactLink
          href={`https://wa.me/${b.whatsapp.replace(/\D/g, '')}`}
          icon={MessageSquare}
          hint="WhatsApp"
        >
          {b.whatsapp}
        </ContactLink>
        <ContactLink href={`mailto:${b.email}`} icon={Mail}>
          {b.email}
        </ContactLink>
      </ul>
    </section>
  )
}

function ContactLink({
  href,
  icon: Icon,
  children,
  hint,
}: {
  href: string
  icon: typeof Phone
  children: React.ReactNode
  hint?: string
}) {
  return (
    <li>
      <a
        href={href}
        target={href.startsWith('http') ? '_blank' : undefined}
        rel={href.startsWith('http') ? 'noopener noreferrer' : undefined}
        className="flex items-center gap-2 text-xs text-gray-700 hover:text-gray-900 transition-colors py-1"
      >
        <Icon className="w-3.5 h-3.5 text-gray-400 shrink-0" />
        <span className="truncate">{children}</span>
        {hint ? (
          <span className="ml-auto text-[10px] font-bold uppercase tracking-wider text-gray-400">
            {hint}
          </span>
        ) : null}
      </a>
    </li>
  )
}

/* ---------- Documents ---------- */

function DocumentsCard({ booking: b }: { booking: Booking }) {
  const docs = [
    {
      label: 'Contract',
      done: b.contractSigned,
      hintDone: 'Signed',
      hintMissing: b.contractSentAt ? 'Sent — awaiting signature' : 'Not yet sent',
    },
    {
      label: 'Invoice',
      done: b.invoiceIssued,
      hintDone: 'Issued',
      hintMissing: 'Not issued',
    },
    {
      label: 'Day-of brief',
      done: b.briefSubmitted,
      hintDone: 'Submitted',
      hintMissing: 'Awaiting from couple',
    },
  ]
  return (
    <section className="bg-white rounded-2xl border border-gray-100 shadow-[0_2px_10px_-4px_rgba(0,0,0,0.05)] p-5">
      <p className="text-[11px] font-bold uppercase tracking-[0.14em] text-gray-500 mb-3">
        Documents
      </p>
      <ul className="space-y-2">
        {docs.map((d) => (
          <li
            key={d.label}
            className="flex items-center gap-2.5 px-3 py-2 rounded-lg border border-gray-100 hover:border-gray-300 transition-colors"
          >
            {d.done ? (
              <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
            ) : (
              <Circle className="w-4 h-4 text-gray-300 shrink-0" />
            )}
            <div className="flex-1 min-w-0">
              <p className="text-xs font-semibold text-gray-900">{d.label}</p>
              <p className="text-[10px] text-gray-500 truncate">
                {d.done ? d.hintDone : d.hintMissing}
              </p>
            </div>
            {d.done ? (
              <button
                type="button"
                className="text-gray-400 hover:text-gray-700 transition-colors"
                aria-label={`Download ${d.label}`}
              >
                <Download className="w-3.5 h-3.5" />
              </button>
            ) : null}
          </li>
        ))}
      </ul>
    </section>
  )
}

/* ---------- Quick actions ---------- */

function QuickActions({ booking: b }: { booking: Booking }) {
  const actions: { label: string; icon: typeof Send; tone?: 'danger' }[] = []
  if (b.stage !== 'cancelled' && b.stage !== 'completed') {
    actions.push({ label: 'Send reminder', icon: Send })
    actions.push({ label: 'Reschedule', icon: RefreshCcw })
  }
  if (b.stage !== 'completed' && b.stage !== 'cancelled') {
    actions.push({ label: 'Cancel booking', icon: CalendarX, tone: 'danger' })
  }
  if (b.stage === 'completed') {
    actions.push({ label: 'Send invoice', icon: FileText })
    actions.push({ label: 'Mark for review', icon: Send })
  }

  if (actions.length === 0) return null

  return (
    <section className="bg-white rounded-2xl border border-gray-100 shadow-[0_2px_10px_-4px_rgba(0,0,0,0.05)] p-5">
      <p className="text-[11px] font-bold uppercase tracking-[0.14em] text-gray-500 mb-3">
        Quick actions
      </p>
      <ul className="space-y-1">
        {actions.map((a) => {
          const Icon = a.icon
          return (
            <li key={a.label}>
              <button
                type="button"
                className={cn(
                  'w-full inline-flex items-center gap-2 px-3 py-2 rounded-md text-xs font-semibold transition-colors',
                  a.tone === 'danger'
                    ? 'text-rose-600 hover:bg-rose-50'
                    : 'text-gray-700 hover:bg-gray-50',
                )}
              >
                <Icon className="w-3.5 h-3.5" />
                {a.label}
              </button>
            </li>
          )
        })}
      </ul>
    </section>
  )
}

