import type { ReactNode } from 'react'
import { redirect } from 'next/navigation'
import { getCurrentVendor } from '@/lib/vendor'
import { ActiveVendorProvider } from '@/lib/onboarding/active-vendor-context'
import PortalShell from './PortalShell'

export default async function PortalLayout({
  children,
}: {
  children: ReactNode
}) {
  const state = await getCurrentVendor()

  // Gate the portal shell behind admin approval. Only `live` vendors reach the
  // dashboard; everyone else is funnelled to where they can act:
  //   - not applied / mid-application → the onboarding wizard
  //   - submitted (pending) / suspended → the /verify status + document hub
  if (state.kind === 'no-application') redirect('/onboard')
  if (state.kind === 'pending-approval') {
    redirect(state.status === 'application_in_progress' ? '/onboard' : '/verify')
  }
  if (state.kind === 'suspended') redirect('/verify')

  // Vendor name + slug are resolved here in the server layout — PortalShell
  // needs the name to greet the vendor in the header, and the slug feeds
  // the "View public storefront" link in the header.
  // `no-env` falls back to the seed values so designers see a populated
  // greeting offline.
  const vendorName =
    state.kind === 'live' ? state.vendor.businessName : 'OpusFesta Photography'
  const vendorSlug =
    state.kind === 'live' ? state.vendor.slug : null
  // Scope every storefront/onboarding-draft consumer in the portal to THIS
  // business, so a user who owns several vendor profiles never sees (or saves)
  // one business's draft fields against another. `null` only on the no-env dev
  // fallback, which reads the shared 'onboarding' slot.
  const activeVendorId = state.kind === 'live' ? state.vendor.id : null

  return (
    <ActiveVendorProvider vendorId={activeVendorId}>
      <PortalShell vendorName={vendorName} vendorSlug={vendorSlug}>
        {children}
      </PortalShell>
    </ActiveVendorProvider>
  )
}
