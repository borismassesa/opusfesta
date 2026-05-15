import { Building2, Inbox, Users, type LucideIcon } from 'lucide-react'
import type { HeadlineMetrics } from './queries'

// Top-line "what does the business look like right now" strip. Cards are
// gated by permission so a viewer who can't see vendors doesn't get a
// vendor count, etc. Numbers are derived from real DB rows — no
// hardcoded dummy data.

type MetricSpec = {
  permission: string
  label: string
  value: string
  hint?: string
  icon: LucideIcon
}

export default function MetricStrip({
  metrics,
  granted,
}: {
  metrics: HeadlineMetrics
  granted: Set<string>
}) {
  const all: MetricSpec[] = [
    {
      permission: 'vendor.read',
      label: 'Active vendors',
      value: String(metrics.activeVendors),
      hint:
        metrics.totalVendors > metrics.activeVendors
          ? `${metrics.totalVendors - metrics.activeVendors} in other states`
          : `${metrics.totalVendors} total`,
      icon: Building2,
    },
    {
      permission: 'workforce.read',
      label: 'Team',
      value: String(metrics.activeEmployees),
      hint: `${metrics.dashboardUsers} with dashboard access`,
      icon: Users,
    },
    {
      permission: 'bookings.read',
      label: 'Inquiries this week',
      value: String(metrics.inquiriesThisWeek),
      hint: `${metrics.totalInquiries} total`,
      icon: Inbox,
    },
  ]

  const visible = all.filter((m) => granted.has(m.permission))
  if (visible.length === 0) return null

  return (
    <section aria-labelledby="metric-strip-heading" className="space-y-3">
      <h2
        id="metric-strip-heading"
        className="text-[11px] font-bold uppercase tracking-wider text-gray-500"
      >
        At a glance
      </h2>
      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
        {visible.map((m) => {
          const Icon = m.icon
          return (
            <div
              key={m.label}
              className="rounded-2xl border border-gray-100 bg-white p-4 shadow-[0_2px_10px_-4px_rgba(0,0,0,0.05)]"
            >
              <div className="flex items-center gap-2">
                <span className="inline-flex h-7 w-7 items-center justify-center rounded-lg bg-gray-100 text-gray-700">
                  <Icon className="h-4 w-4" />
                </span>
                <p className="text-[11px] font-bold uppercase tracking-wider text-gray-500">
                  {m.label}
                </p>
              </div>
              <p className="mt-3 text-3xl font-semibold tracking-tight text-gray-900 tabular-nums">
                {m.value}
              </p>
              {m.hint && <p className="mt-1 text-xs text-gray-500">{m.hint}</p>}
            </div>
          )
        })}
      </div>
    </section>
  )
}
