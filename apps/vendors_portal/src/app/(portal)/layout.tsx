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

  // Vendor name is only resolved here in the server layout; PortalShell needs
  // it to greet the vendor in the header on /dashboard. `no-env` falls back
  // to the seed name so designers see a populated greeting offline.
  const vendorName =
    state.kind === 'live' ? state.vendor.businessName : 'OpusFesta Photography'

  return <PortalShell vendorName={vendorName}>{children}</PortalShell>
}
