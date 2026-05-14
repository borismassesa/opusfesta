import type { ReactNode } from 'react'
import { redirect } from 'next/navigation'
import { getAdminAccessRole, isAdminDashboardRole } from '@/lib/admin-auth'

export const dynamic = 'force-dynamic'

export default async function WorkforceLayout({ children }: { children: ReactNode }) {
  const role = await getAdminAccessRole()
  if (!isAdminDashboardRole(role)) redirect('/contribute')
  return <div className="mx-auto max-w-[1400px] px-8 py-10">{children}</div>
}
