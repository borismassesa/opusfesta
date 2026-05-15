import Link from 'next/link'
import {
  CheckCircle2,
  Inbox,
  Mail,
  Store,
  type LucideIcon,
} from 'lucide-react'
import type { ActivityItem, ActivityKind } from './queries'

// Unified activity feed merged across vendor signups, customer inquiries,
// and workforce invitations. Each row shows what happened, when, and a
// link to the page where you'd act on it.

const KIND_ICON: Record<ActivityKind, LucideIcon> = {
  vendor_signup: Store,
  inquiry: Inbox,
  workforce_invite: Mail,
  workforce_invite_accepted: CheckCircle2,
  employee_added: CheckCircle2,
}

const KIND_TONE: Record<ActivityKind, string> = {
  vendor_signup: 'bg-amber-50 text-amber-700',
  inquiry: 'bg-sky-50 text-sky-700',
  workforce_invite: 'bg-gray-100 text-gray-700',
  workforce_invite_accepted: 'bg-emerald-50 text-emerald-700',
  employee_added: 'bg-emerald-50 text-emerald-700',
}

function formatRelative(iso: string): string {
  const diffMs = Date.now() - new Date(iso).getTime()
  if (Number.isNaN(diffMs) || diffMs < 0) return 'just now'
  const min = Math.floor(diffMs / 60_000)
  if (min < 1) return 'just now'
  if (min < 60) return `${min}m ago`
  const hr = Math.floor(min / 60)
  if (hr < 24) return `${hr}h ago`
  const day = Math.floor(hr / 24)
  if (day < 30) return `${day}d ago`
  const month = Math.floor(day / 30)
  if (month < 12) return `${month}mo ago`
  return `${Math.floor(month / 12)}y ago`
}

export default function RecentActivity({
  items,
}: {
  items: ActivityItem[]
}) {
  return (
    <section aria-labelledby="activity-heading" className="space-y-3">
      <h2
        id="activity-heading"
        className="text-[11px] font-bold uppercase tracking-wider text-gray-500"
      >
        Recent activity
      </h2>
      <div className="overflow-hidden rounded-2xl border border-gray-100 bg-white shadow-[0_2px_10px_-4px_rgba(0,0,0,0.05)]">
        {items.length === 0 ? (
          <p className="px-5 py-10 text-center text-sm text-gray-500">
            Nothing has happened on the platform yet.
          </p>
        ) : (
          <ul className="divide-y divide-gray-100">
            {items.map((item) => {
              const Icon = KIND_ICON[item.kind]
              const tone = KIND_TONE[item.kind]
              const body = (
                <div className="flex items-start gap-3 px-5 py-3.5">
                  <span
                    className={`mt-0.5 inline-flex h-8 w-8 shrink-0 items-center justify-center rounded-lg ${tone}`}
                  >
                    <Icon className="h-4 w-4" />
                  </span>
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-sm font-semibold text-gray-900">
                      {item.title}
                    </p>
                    {item.subtitle && (
                      <p className="truncate text-xs text-gray-500">{item.subtitle}</p>
                    )}
                  </div>
                  <span className="shrink-0 text-[11px] tabular-nums text-gray-400">
                    {formatRelative(item.occurredAt)}
                  </span>
                </div>
              )
              return (
                <li key={item.id}>
                  {item.href ? (
                    <Link href={item.href} className="block transition-colors hover:bg-gray-50">
                      {body}
                    </Link>
                  ) : (
                    body
                  )}
                </li>
              )
            })}
          </ul>
        )}
      </div>
    </section>
  )
}
