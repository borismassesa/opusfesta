import {
  SegmentDonut,
  TrendAreaChart,
  TrendBarChart,
} from './Charts'
import type { DashboardCharts } from './queries'
import type { Department } from '../workforce/_lib/types'

// Trends band. Per the product philosophy ("fewer charts, more
// prioritization"), this is capped at 2 cards. Which 2 you see is
// flavoured by department first, then filtered by permission as a
// safety net — so a Marketing Editor without vendor.read still doesn't
// see vendor charts.
//
// Department slants:
//   Founders        — inquiries trend + vendor pipeline donut (macro)
//   Operations      — inquiries trend + vendor pipeline donut
//   Marketing       — vendor signups trend + team by department donut
//   Content/Brand   — inquiries trend only (their decisions are in the lane)
//   Finance & HR    — team by department donut only
//   Technology/UX   — vendor pipeline donut only
//   Interns         — none (read-only orientation)

type Card = {
  id: 'inquiries' | 'signups' | 'pipeline' | 'team'
  permission: string
  render: () => React.ReactNode
}

const DEFAULT_SLANT: Card['id'][] = ['inquiries', 'pipeline']

// Map every department to up to 2 chart IDs. Missing entries fall back
// to DEFAULT_SLANT. Empty arrays mean "no trends panel for this dept".
const DEPARTMENT_SLANT: Record<Department, Card['id'][]> = {
  Founders: ['inquiries', 'pipeline'],
  Operations: ['inquiries', 'pipeline'],
  Technology: ['pipeline'],
  'Content, Brand and Social Media': ['inquiries'],
  'Marketing and Partnership': ['signups', 'team'],
  'UI/UX Design': ['pipeline'],
  'Finance and Accountings': ['team'],
  HR: ['team'],
  Interns: [],
}

export default function ChartGrid({
  charts,
  granted,
  department,
}: {
  charts: DashboardCharts
  granted: Set<string>
  department: Department | null
}) {
  const cards: Card[] = [
    {
      id: 'inquiries',
      permission: 'bookings.read',
      render: () => (
        <TrendAreaChart
          key="inquiries"
          title="Inquiries"
          hint="Last 8 weeks"
          data={charts.inquiriesByWeek}
          color="#10b981"
        />
      ),
    },
    {
      id: 'signups',
      permission: 'vendor.read',
      render: () => (
        <TrendBarChart
          key="signups"
          title="Vendor signups"
          hint="Last 8 weeks"
          data={charts.signupsByWeek}
          color="#0ea5e9"
        />
      ),
    },
    {
      id: 'pipeline',
      permission: 'vendor.read',
      render: () => (
        <SegmentDonut
          key="pipeline"
          title="Vendor pipeline"
          hint="By onboarding status"
          data={charts.vendorPipeline}
        />
      ),
    },
    {
      id: 'team',
      permission: 'workforce.read',
      render: () => (
        <SegmentDonut
          key="team"
          title="Team by department"
          hint="Active employees only"
          data={charts.teamByDepartment}
        />
      ),
    },
  ]

  const wantedIds = department ? DEPARTMENT_SLANT[department] : DEFAULT_SLANT
  // Preserve the requested order so the slant intent is visible — e.g.
  // Marketing leads with signups, not the alphabetical default.
  const visible = wantedIds
    .map((id) => cards.find((c) => c.id === id))
    .filter((c): c is Card => Boolean(c))
    .filter((c) => granted.has(c.permission))
    .slice(0, 2)

  if (visible.length === 0) return null

  return (
    <section aria-labelledby="charts-heading" className="space-y-3">
      <h2
        id="charts-heading"
        className="text-[11px] font-bold uppercase tracking-wider text-gray-500"
      >
        Trends
      </h2>
      <div className="grid grid-cols-1 gap-4 xl:grid-cols-2">
        {visible.map((c) => c.render())}
      </div>
    </section>
  )
}
