import { redirect } from 'next/navigation'
import { getAdminAccessRole, getCallerEmail } from '@/lib/admin-auth'
import WorkforceHeading from '../_components/PageHeading'
import RolesClient from './RolesClient'
import {
  getAllRoleMembers,
  getEmployees,
  getRoles,
  getWorkforceInvitations,
} from '../_lib/queries'
import { PERMISSIONS } from '../_lib/types'

export const dynamic = 'force-dynamic'

export default async function RolesPage() {
  // The (admin) layout already gates on dashboard role, but redirect
  // editors/viewers here too so they don't see the page chrome before
  // the server actions throw. Owners + admins past this point.
  const role = await getAdminAccessRole()
  if (role !== 'owner' && role !== 'admin') {
    redirect('/')
  }

  const [roles, employees, memberMap, callerEmail, invitations] = await Promise.all([
    getRoles(),
    getEmployees(),
    getAllRoleMembers(),
    getCallerEmail(),
    getWorkforceInvitations('pending'),
  ])

  // Plain object so it crosses the server→client boundary cleanly.
  const memberIdsByRole: Record<string, string[]> = {}
  for (const r of roles) memberIdsByRole[r.id] = memberMap.get(r.id) ?? []

  return (
    <>
      <WorkforceHeading title="Roles & Permissions" />
      <RolesClient
        roles={roles}
        permissions={PERMISSIONS}
        employees={employees}
        memberIdsByRole={memberIdsByRole}
        invitations={invitations}
        callerEmail={callerEmail}
        callerIsOwner={role === 'owner'}
      />
    </>
  )
}
