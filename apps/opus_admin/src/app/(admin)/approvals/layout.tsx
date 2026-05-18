import type { ReactNode } from 'react'
import { redirect } from 'next/navigation'
import {
  getAdminAccessRole,
  hasAnyPermission,
  isAdminDashboardRole,
} from '@/lib/admin-auth'

export const dynamic = 'force-dynamic'

export default async function ApprovalsLayout({ children }: { children: ReactNode }) {
  const role = await getAdminAccessRole()
  if (!isAdminDashboardRole(role)) redirect('/contribute')
  // Approvals is for finance/HR/ops approvers. Bounce anyone who only
  // holds CMS or vendor-moderation permissions (Content Editor, Vendor
  // Success) — they have no business in the travel/payments/procurement
  // feed. Mirror of the sidebar gate in components/Sidebar.tsx.
  if (!(await hasAnyPermission(['finance.read', 'workforce.read']))) {
    redirect('/')
  }
  return (
    <div className="mx-auto max-w-[1400px] px-4 py-6 sm:px-6 sm:py-8 lg:px-8 lg:py-10">
      {children}
    </div>
  )
}
