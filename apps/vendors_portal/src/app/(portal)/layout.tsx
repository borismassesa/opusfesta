import type { ReactNode } from 'react'
import { redirect } from 'next/navigation'
import { getCurrentVendor } from '@/lib/vendor'
import PortalShell from './PortalShell'

export default async function PortalLayout({
  children,
}: {
  children: ReactNode
}) {
  const state = await getCurrentVendor()

  // Gate the portal shell behind admin approval. Only `live` vendors reach the
  // dashboard; everyone else funnels through /pending which shows exactly which
  // verification gate they're at.
  if (
    state.kind === 'no-application' ||
    state.kind === 'pending-approval' ||
    state.kind === 'suspended'
  ) {
    redirect('/pending')
  }

  return <PortalShell>{children}</PortalShell>
}
