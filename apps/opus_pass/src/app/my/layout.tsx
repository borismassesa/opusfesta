import type { ReactNode } from 'react'
import DashboardShell from '@/components/dashboard/DashboardShell'
import { getCoupleProfile, coupleDisplayName } from '@/lib/dashboard/queries'

export const dynamic = 'force-dynamic'

export default async function MyLayout({ children }: { children: ReactNode }) {
  const profile = await getCoupleProfile()
  return <DashboardShell coupleName={coupleDisplayName(profile)}>{children}</DashboardShell>
}
