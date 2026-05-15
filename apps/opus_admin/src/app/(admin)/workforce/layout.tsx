import type { ReactNode } from 'react'
import { redirect } from 'next/navigation'
import { getAdminAccessRole, hasPermission, isAdminDashboardRole } from '@/lib/admin-auth'

export const dynamic = 'force-dynamic'

export default async function WorkforceLayout({ children }: { children: ReactNode }) {
  const role = await getAdminAccessRole()
  if (!isAdminDashboardRole(role)) redirect('/contribute')
  // Permission-level gate: someone who can sign in to the dashboard but
  // doesn't hold workforce.read shouldn't see /workforce/* at all. They
  // get bounced to / where the (admin) layout decides where to land them.
  if (!(await hasPermission('workforce.read'))) redirect('/')
  return (
    <div className="mx-auto max-w-[1400px] px-4 py-6 sm:px-6 sm:py-8 lg:px-8 lg:py-10">
      {children}
    </div>
  )
}
