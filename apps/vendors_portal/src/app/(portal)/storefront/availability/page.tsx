import { getLocale } from '@/lib/cms/locale'
import { loadPortalUiStrings } from '@/lib/cms/portal-ui'
import { PortalUIStringsProvider } from '@/components/providers/PortalUIStringsProvider'
import AvailabilityClient from './AvailabilityClient'

export default async function AvailabilityPage() {
  const locale = await getLocale()
  const availabilityStrings = await loadPortalUiStrings('storefront-availability', locale)
  return (
    <PortalUIStringsProvider bundles={{ 'storefront-availability': availabilityStrings }}>
      <AvailabilityClient />
    </PortalUIStringsProvider>
  )
}
