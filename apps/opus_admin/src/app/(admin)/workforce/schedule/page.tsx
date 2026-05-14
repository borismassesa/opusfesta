import WorkforceHeading from '../_components/PageHeading'
import ScheduleClient from './ScheduleClient'
import { DEPARTMENTS, getEmployees, getShifts } from '../_lib/queries'

export const dynamic = 'force-dynamic'

export default async function SchedulePage() {
  const [employees, shifts] = await Promise.all([getEmployees(), getShifts()])
  return (
    <>
      <WorkforceHeading
        title="Schedule"
        subtitle="Weekly shift roster across departments and locations"
      />
      <ScheduleClient employees={employees} shifts={shifts} departments={DEPARTMENTS} />
    </>
  )
}
