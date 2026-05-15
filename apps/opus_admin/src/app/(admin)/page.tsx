import { getCallerPermissions } from '@/lib/admin-auth'
import DashboardHeading from './_dashboard/DashboardHeading'
import ActionQueue from './_dashboard/ActionQueue'
import DepartmentLane from './_dashboard/DepartmentLane'
import MetricStrip from './_dashboard/MetricStrip'
import ChartGrid from './_dashboard/ChartGrid'
import PlatformPulse from './_dashboard/PlatformPulse'
import RecentActivity from './_dashboard/RecentActivity'
import QuickActions from './_dashboard/QuickActions'
import { getDashboardSnapshot } from './_dashboard/queries'

export const dynamic = 'force-dynamic'

// Soft-flavours the dashboard subtitle by department. Founders see the
// platform-wide framing; departmental folks see "you're seeing your
// team's view" so it's clear why the action queue / metrics are biased
// to their work.
function buildSubtitle(department: string | null): string {
  if (!department) return "Here's what's happening across OpusFesta today."
  if (department === 'Founders') {
    return "Platform-wide view — every department, every queue."
  }
  return `Your view as ${department} · everything you can act on right now.`
}

// Admin dashboard. Server component that pulls a single snapshot of
// counts + recent activity in one round trip, then composes the four
// sections — each gated by the caller's permission set so a finance-only
// viewer (for example) doesn't see vendor moderation cards.
//
// Personalised "Welcome, <name>" lives in <DashboardHeading /> (client)
// because it needs Clerk's useUser hook. The component renders nothing
// visible — it just pushes into the global PageHeading context that
// drives the admin Header.

export default async function DashboardPage() {
  const [snapshot, permissions] = await Promise.all([
    getDashboardSnapshot(),
    getCallerPermissions(),
  ])

  return (
    <div className="px-8 py-8">
      <DashboardHeading subtitle={buildSubtitle(snapshot.caller.department)} />

      <div className="mx-auto max-w-[1400px] space-y-8">
        {/* KPI strip at the top — the at-a-glance numbers anchor the page
            so the rest of the dashboard reads as supporting detail. */}
        <MetricStrip metrics={snapshot.headline} granted={permissions} />

        {/* Trends (charts) take the left, prominent column. Needs your
            attention sits on the right as a compact action list — the
            two flow as a hero band: numbers up top, charts in the middle,
            decisions waiting at hand. */}
        <div className="grid grid-cols-1 gap-6 xl:grid-cols-[minmax(0,2fr)_minmax(0,1fr)]">
          <ChartGrid
            charts={snapshot.charts}
            granted={permissions}
            department={snapshot.caller.department}
          />
          <ActionQueue
            counts={snapshot.actionQueue}
            granted={permissions}
            variant="list"
          />
        </div>

        {/* Department-flavoured "decisions for today" band. Renders
            nothing for Founders (they get PlatformPulse instead) or
            callers without a matching workforce_employees row. */}
        {snapshot.departmentLane && (
          <DepartmentLane lane={snapshot.departmentLane} />
        )}

        {/* Founders-only pulse band — surfaces the cross-departmental
            "stuck" items no single owner pursues by default. The query
            layer returns null for non-Founders, so this just doesn't
            render for everyone else. */}
        {snapshot.platformPulse && (
          <PlatformPulse pulse={snapshot.platformPulse} />
        )}

        {/* Two-column layout below the hero — activity on the left
            (the bigger surface, since the feed grows over time), quick
            actions on the right as a stable shortcut rail. */}
        <div className="grid grid-cols-1 gap-8 lg:grid-cols-[minmax(0,1.6fr)_minmax(0,1fr)]">
          <RecentActivity items={snapshot.activity} />
          <QuickActions granted={permissions} />
        </div>
      </div>
    </div>
  )
}
