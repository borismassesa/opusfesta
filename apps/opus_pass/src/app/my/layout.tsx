import type { ReactNode } from 'react'
import DashboardShell from '@/components/dashboard/DashboardShell'
import { requireDashboardUser } from '@/lib/dashboard/auth'
import { getCoupleProfile, coupleDisplayName } from '@/lib/dashboard/queries'

export const dynamic = 'force-dynamic'

export default async function MyLayout({ children }: { children: ReactNode }) {
  // Provision/guard the signed-in couple (Clerk middleware enforces auth on /my).
  await requireDashboardUser()
  const profile = await getCoupleProfile()
  return <DashboardShell coupleName={coupleDisplayName(profile)}>{children}</DashboardShell>
}
