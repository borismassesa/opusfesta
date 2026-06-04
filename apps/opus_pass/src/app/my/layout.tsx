import type { Metadata } from 'next'
import type { ReactNode } from 'react'
import { cookies } from 'next/headers'
import DashboardShell from '@/components/dashboard/DashboardShell'
import { requireDashboardUser } from '@/lib/dashboard/auth'
import { getCoupleProfile, coupleDisplayName } from '@/lib/dashboard/queries'

export const dynamic = 'force-dynamic'

export const metadata: Metadata = {
  robots: { index: false, follow: false },
}

export default async function MyLayout({ children }: { children: ReactNode }) {
  const user = await requireDashboardUser('/my/dashboard')
  const profile = await getCoupleProfile()
  const coupleName = coupleDisplayName(profile)
  const initial = (user.name ?? user.email).charAt(0).toUpperCase()
  const collapsed = (await cookies()).get('sidebar_collapsed')?.value === '1'

  return (
    <DashboardShell
      coupleName={coupleName}
      userEmail={user.email}
      userInitial={initial}
      defaultCollapsed={collapsed}
    >
      {children}
    </DashboardShell>
  )
}
