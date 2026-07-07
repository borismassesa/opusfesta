import type { ReactNode } from 'react'
import { getLocale } from '@/lib/cms/locale'
import { loadPortalUiStrings } from '@/lib/cms/portal-ui'
import { PortalUIStringsProvider } from '@/components/providers/PortalUIStringsProvider'
import { StorefrontPublishBar } from './StorefrontPublishBar'

// NOTE: there is intentionally no "finish onboarding" gate here. The server
// portal layout (`(portal)/layout.tsx`) already redirects any vendor who
// isn't approved-and-active to /onboard or /verify, so every vendor that
// reaches this storefront editor is a `live` (approved) vendor. The old
// gate keyed off the localStorage onboarding draft (`categoryId` /
// `submittedAt`), which is empty on a fresh device, after clearing storage,
// or when an admin approves the vendor — wrongly showing approved vendors a
// "Your storefront isn't live yet / Start onboarding" dead-end that
// contradicted the dashboard. Editors read their data from the DB, so they
// render correctly without the local draft.
export default async function ListingLayout({ children }: { children: ReactNode }) {
  const locale = await getLocale()
  const storefrontChromeStrings = await loadPortalUiStrings('storefront-chrome', locale)
  return (
    <PortalUIStringsProvider bundles={{ 'storefront-chrome': storefrontChromeStrings }}>
      <StorefrontPublishBar />
      {children}
    </PortalUIStringsProvider>
  )
}
