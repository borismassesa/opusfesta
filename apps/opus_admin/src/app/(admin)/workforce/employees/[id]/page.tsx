import { notFound } from 'next/navigation'
import { getAdminAccessRole } from '@/lib/admin-auth'
import {
  DEPARTMENTS,
  getEmployeeOrgContext,
  getEmployeeWithManagerId,
  getEmployees,
  getRoles,
} from '../../_lib/queries'
import {
  getCertifications,
  getEmployeeBadges,
  getEmployeeDocuments,
  getEmployeeSkills,
  getResumeEntries,
} from '../../_lib/records'
import EmployeeDetailClient from './EmployeeDetailClient'

export const dynamic = 'force-dynamic'

export default async function EmployeeDetailPage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const { id } = await params

  const result = await getEmployeeWithManagerId(id)
  if (!result) notFound()
  const { employee, managerId } = result

  // Single Promise.all so the seven child fetches share latency.
  // Server actions revalidate `/workforce/employees/[id]`, so this
  // server component re-renders on every successful mutation.
  const [
    org,
    roles,
    callerRole,
    allEmployees,
    resumeEntries,
    skills,
    certifications,
    badges,
    documents,
  ] = await Promise.all([
    getEmployeeOrgContext(employee.id, managerId),
    getRoles(),
    getAdminAccessRole(),
    getEmployees(),
    getResumeEntries(employee.id),
    getEmployeeSkills(employee.id),
    getCertifications(employee.id),
    getEmployeeBadges(employee.id),
    getEmployeeDocuments(employee.id),
  ])

  return (
    <EmployeeDetailClient
      employee={employee}
      manager={org.manager}
      directReports={org.reports}
      departments={DEPARTMENTS}
      roles={roles}
      managerCandidates={allEmployees.map((e) => ({
        id: e.id,
        name: e.name,
        jobTitle: e.jobTitle,
      }))}
      callerIsOwner={callerRole === 'owner'}
      resumeEntries={resumeEntries}
      skills={skills}
      certifications={certifications}
      badges={badges}
      documents={documents}
    />
  )
}
