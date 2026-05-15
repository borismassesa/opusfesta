import { getAdminAccessRole } from '@/lib/admin-auth'
import WorkforceHeading from '../_components/PageHeading'
import EmployeesClient from './EmployeesClient'
import { DEPARTMENTS, getEmployees, getOpenJobsCount, getRoles } from '../_lib/queries'

export const dynamic = 'force-dynamic'

export default async function EmployeesPage() {
  // Workforce roles are needed in the dialog so admins can pick which
  // dashboard role a new hire should hold; callerIsOwner gates the
  // grant/revoke controls (only owners can change who has dashboard
  // access — see grantDashboardAccess in actions.ts).
  const [employees, openJobs, roles, role] = await Promise.all([
    getEmployees(),
    getOpenJobsCount(),
    getRoles(),
    getAdminAccessRole(),
  ])

  return (
    <>
      <WorkforceHeading title="Employees" />
      <EmployeesClient
        employees={employees}
        departments={DEPARTMENTS}
        openJobs={openJobs}
        roles={roles}
        callerIsOwner={role === 'owner'}
      />
    </>
  )
}
