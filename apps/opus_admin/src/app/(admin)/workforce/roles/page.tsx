import WorkforceHeading from '../_components/PageHeading'
import RolesClient from './RolesClient'
import { getAllRoleMembers, getEmployees, getRoles } from '../_lib/queries'
import { PERMISSIONS } from '../_lib/types'

export const dynamic = 'force-dynamic'

export default async function RolesPage() {
  const [roles, employees, memberMap] = await Promise.all([
    getRoles(),
    getEmployees(),
    getAllRoleMembers(),
  ])

  // Plain object so it crosses the server→client boundary cleanly.
  const memberIdsByRole: Record<string, string[]> = {}
  for (const r of roles) memberIdsByRole[r.id] = memberMap.get(r.id) ?? []

  const totalMembers = Object.values(memberIdsByRole).reduce((s, m) => s + m.length, 0)

  return (
    <>
      <WorkforceHeading
        title="Roles & Permissions"
        subtitle={`${roles.length} roles · ${totalMembers} members · ${PERMISSIONS.length} permissions`}
      />
      <RolesClient
        roles={roles}
        permissions={PERMISSIONS}
        employees={employees}
        memberIdsByRole={memberIdsByRole}
      />
    </>
  )
}
