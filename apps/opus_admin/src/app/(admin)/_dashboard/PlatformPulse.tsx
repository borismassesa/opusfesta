import Link from 'next/link'
import {
  AlertTriangle,
  Clock,
  Inbox,
  MailWarning,
  Pause,
  Wrench,
  type LucideIcon,
} from 'lucide-react'
import type { PlatformPulse } from './queries'

// Founders-only band. Surfaces the long-tail issues no department owns
// outright: vendors who started onboarding and never finished, suspended
// vendors waiting for a decision, inquiries customers haven't heard back
// on after a week, invitations about to expire. Each row is a count + a
// link to the page where the work would happen.
//
// Visible only when the caller's department === "Founders" (the page
// gates this — see queries.ts: platformPulse is null otherwise).

type Row = {
  icon: LucideIcon
  label: string
  count: number
  href: string
  tone: 'amber' | 'rose' | 'sky' | 'gray'
}

const TONE_BG: Record<Row['tone'], string> = {
  amber: 'bg-amber-50 text-amber-700',
  rose: 'bg-rose-50 text-rose-700',
  sky: 'bg-sky-50 text-sky-700',
  gray: 'bg-gray-100 text-gray-700',
}

export default function PlatformPulse({ pulse }: { pulse: PlatformPulse }) {
  const rows: Row[] = [
    {
      icon: Clock,
      label: 'Vendors stuck in onboarding (no progress in 14d)',
      count: pulse.vendorsStuckInOnboarding,
      href: '/operations/vendors',
      tone: 'amber',
    },
    {
      icon: Wrench,
      label: 'Vendors with corrections requested',
      count: pulse.vendorsNeedingCorrections,
      href: '/operations/vendors',
      tone: 'amber',
    },
    {
      icon: Pause,
      label: 'Suspended vendors awaiting a decision',
      count: pulse.vendorsSuspended,
      href: '/operations/vendors',
      tone: 'rose',
    },
    {
      icon: Inbox,
      label: 'Inquiries unanswered for over a week',
      count: pulse.inquiriesStaleOver7Days,
      href: '/operations/bookings',
      tone: 'rose',
    },
    {
      icon: MailWarning,
      label: 'Invitations expiring in the next 3 days',
      count: pulse.invitationsExpiringSoon,
      href: '/workforce/roles',
      tone: 'sky',
    },
  ]

  // Show non-zero rows on top, then a single muted "all clear" row if
  // every metric is zero — Founders should still see the section so they
  // know the panel exists and works, even on a quiet week.
  const flagged = rows.filter((r) => r.count > 0)
  const allClear = flagged.length === 0

  return (
    <section aria-labelledby="platform-pulse-heading" className="space-y-3">
      <header className="flex items-center gap-2">
        <AlertTriangle className="h-4 w-4 text-gray-400" />
        <h2
          id="platform-pulse-heading"
          className="text-[11px] font-bold uppercase tracking-wider text-gray-500"
        >
          Platform pulse
          <span className="ml-2 font-normal normal-case text-gray-400">
            · Founders-only
          </span>
        </h2>
      </header>

      <div className="overflow-hidden rounded-2xl border border-gray-100 bg-white shadow-[0_2px_10px_-4px_rgba(0,0,0,0.05)]">
        {allClear ? (
          <div className="px-5 py-8 text-center">
            <p className="text-sm font-semibold text-gray-900">
              Nothing slipping through the cracks
            </p>
            <p className="mt-1 text-xs text-gray-500">
              No stuck vendors, suspended accounts, stale inquiries or
              expiring invitations to follow up on.
            </p>
          </div>
        ) : (
          <ul className="divide-y divide-gray-100">
            {flagged.map((row) => {
              const Icon = row.icon
              return (
                <li key={row.label}>
                  <Link
                    href={row.href}
                    className="flex items-center gap-3 px-5 py-3.5 transition-colors hover:bg-gray-50"
                  >
                    <span
                      className={`inline-flex h-8 w-8 items-center justify-center rounded-lg ${TONE_BG[row.tone]}`}
                    >
                      <Icon className="h-4 w-4" />
                    </span>
                    <p className="flex-1 text-sm text-gray-900">{row.label}</p>
                    <span className="text-lg font-semibold tabular-nums text-gray-900">
                      {row.count}
                    </span>
                  </Link>
                </li>
              )
            })}
          </ul>
        )}
      </div>
    </section>
  )
}
