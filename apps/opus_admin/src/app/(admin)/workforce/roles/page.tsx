import { redirect } from 'next/navigation'
import {
  getAdminAccessRole,
  getCallerEmail,
  getCallerPermissions,
} from '@/lib/admin-auth'
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

  const [roles, employees, memberMap, callerEmail, invitations, permissions] =
    await Promise.all([
      getRoles(),
      getEmployees(),
      getAllRoleMembers(),
      getCallerEmail(),
      getWorkforceInvitations('pending'),
      getCallerPermissions(),
    ])

  // Mirrors the server-action gates: grant / change-role / revoke access and
  // invitation resend/revoke all require `platform.admin` (owner-only). The
  // UI hides those controls for anyone without it so non-owners never click a
  // button that would throw "You don't have permission".
  const canManageAccess = permissions.has('platform.admin')

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
        canManageAccess={canManageAccess}
      />
    </>
  )
}
