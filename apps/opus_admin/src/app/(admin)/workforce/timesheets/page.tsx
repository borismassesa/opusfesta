import { hasPermission, requirePermission } from '@/lib/admin-auth'
import WorkforceHeading from '../_components/PageHeading'
import {
  getCurrentlyClockedEmployees,
  getEmployees,
  getPunchesForRange,
} from '../_lib/queries'
import TimesheetsClient from './TimesheetsClient'

export const dynamic = 'force-dynamic'

const TZ = 'Africa/Dar_es_Salaam'

// Same Monday-anchored week as the employee /me/timeclock page. Kept
// duplicated rather than shared because the two pages have different
// surfaces and we want to avoid pulling page-level helpers across route
// boundaries.
function mondayOf(now: Date): Date {
  const fmt = new Intl.DateTimeFormat('en-US', {
    timeZone: TZ,
    weekday: 'short',
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
  })
  const parts = fmt.formatToParts(now)
  const get = (t: string) => parts.find((p) => p.type === t)?.value ?? ''
  const map: Record<string, number> = { Sun: 6, Mon: 0, Tue: 1, Wed: 2, Thu: 3, Fri: 4, Sat: 5 }
  const sinceMonday = map[get('weekday')] ?? 0
  const today = new Date(`${get('year')}-${get('month')}-${get('day')}T00:00:00+03:00`)
  return new Date(today.getTime() - sinceMonday * 86_400_000)
}

function parseWeekParam(raw: string | undefined, now: Date): Date {
  if (raw && /^\d{4}-\d{2}-\d{2}$/.test(raw)) {
    return new Date(`${raw}T00:00:00+03:00`)
  }
  return mondayOf(now)
}

type Search = { week?: string }

export default async function TimesheetsPage({
  searchParams,
}: {
  searchParams: Promise<Search>
}) {
  // Viewing timesheets is gated on workforce.read so Finance / Viewer
  // roles can review hours for payroll + audits. Edits inside the page
  // (admin actions in actions.ts) stay gated on workforce.write.
  await requirePermission('workforce.read')
  const params = await searchParams

  const now = new Date()
  const weekStart = parseWeekParam(params.week, now)
  const weekEnd = new Date(weekStart.getTime() + 7 * 86_400_000)

  const [employees, punches, currentlyClocked, canEdit] = await Promise.all([
    getEmployees(),
    getPunchesForRange(weekStart.toISOString(), weekEnd.toISOString()),
    getCurrentlyClockedEmployees(),
    hasPermission('workforce.write'),
  ])

  return (
    <>
      <WorkforceHeading
        title="Timesheets"
        subtitle="See who's working, review hours, fix punches, export for payroll."
      />
      <TimesheetsClient
        employees={employees.map((e) => ({
          id: e.id,
          employeeCode: e.employeeCode,
          name: e.name,
          department: e.department,
          avatarUrl: e.avatarUrl,
          avatarColor: e.avatarColor,
          status: e.status,
        }))}
        punches={punches}
        currentlyClocked={currentlyClocked}
        weekStartIso={weekStart.toISOString()}
        timeZone={TZ}
        canEdit={canEdit}
      />
    </>
  )
}
