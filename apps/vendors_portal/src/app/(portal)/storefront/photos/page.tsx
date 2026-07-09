import { getLocale } from '@/lib/cms/locale'
import { loadPortalUiStrings } from '@/lib/cms/portal-ui'
import { PortalUIStringsProvider } from '@/components/providers/PortalUIStringsProvider'
import PhotosClient from './PhotosClient'

export default async function PhotosPage() {
  const locale = await getLocale()
  const photosTeamStrings = await loadPortalUiStrings('storefront-photos-team', locale)
  return (
    <PortalUIStringsProvider bundles={{ 'storefront-photos-team': photosTeamStrings }}>
      <PhotosClient />
    </PortalUIStringsProvider>
  )
}
