import WorkforceHeading from '../_components/PageHeading'
import LeaveClient from './LeaveClient'
import { getAttendance, getEmployees, getLeaveRequests } from '../_lib/queries'

export const dynamic = 'force-dynamic'

// "Today" comes from the request rather than a hard-coded date so the
// dashboard tracks the calendar. Locked to UTC date for now; we'll
// switch to TZ-aware once we wire `intl-tz` into the admin app.
function todayDate(): string {
  return new Date().toISOString().slice(0, 10)
}

export default async function LeavePage() {
  const today = todayDate()
  const [employees, requests, attendance] = await Promise.all([
    getEmployees(),
    getLeaveRequests(),
    getAttendance(today),
  ])
  const pending = requests.filter((r) => r.status === 'Pending').length
  const subtitle = pending > 0
    ? `${pending} leave request${pending === 1 ? '' : 's'} waiting for approval`
    : 'No pending approvals'
  return (
    <>
      <WorkforceHeading title="Leave & Attendance" subtitle={subtitle} />
      <LeaveClient
        employees={employees}
        requests={requests}
        attendance={attendance}
      />
    </>
  )
}
