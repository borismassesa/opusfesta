import type { ReactNode } from 'react'
import { redirect } from 'next/navigation'
import { getAdminAccessRole, hasAnyPermission, isAdminDashboardRole } from '@/lib/admin-auth'

export const dynamic = 'force-dynamic'

export default async function GrowthLayout({ children }: { children: ReactNode }) {
  const role = await getAdminAccessRole()
  if (!isAdminDashboardRole(role)) redirect('/contribute')
  if (!(await hasAnyPermission(['growth.write', 'growth.admin']))) redirect('/')
  return (
    <div className="mx-auto max-w-[1400px] px-4 py-6 sm:px-6 sm:py-8 lg:px-8 lg:py-10">
      {children}
    </div>
  )
}
