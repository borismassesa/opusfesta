import WorkforceHeading from '../_components/PageHeading'
import EmployeesClient from './EmployeesClient'
import { DEPARTMENTS, getEmployees, getOpenJobsCount } from '../_lib/queries'

export const dynamic = 'force-dynamic'

export default async function EmployeesPage() {
  const [employees, openJobs] = await Promise.all([getEmployees(), getOpenJobsCount()])
  const active = employees.filter((e) => e.status !== 'Resigned').length
  const onLeave = employees.filter((e) => e.status === 'On Leave').length
  const onboarding = employees.filter((e) => e.status === 'Onboarding').length
  const subtitle = `${active} active people · ${onLeave} on leave · ${onboarding} onboarding`

  return (
    <>
      <WorkforceHeading title="Employees" subtitle={subtitle} />
      <EmployeesClient employees={employees} departments={DEPARTMENTS} openJobs={openJobs} />
    </>
  )
}
