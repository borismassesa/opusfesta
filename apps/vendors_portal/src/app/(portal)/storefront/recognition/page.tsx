import { getLocale } from '@/lib/cms/locale'
import { loadPortalUiStrings } from '@/lib/cms/portal-ui'
import { PortalUIStringsProvider } from '@/components/providers/PortalUIStringsProvider'
import RecognitionClient from './RecognitionClient'

export default async function RecognitionPage() {
  const locale = await getLocale()
  const photosTeamStrings = await loadPortalUiStrings('storefront-photos-team', locale)
  return (
    <PortalUIStringsProvider bundles={{ 'storefront-photos-team': photosTeamStrings }}>
      <RecognitionClient />
    </PortalUIStringsProvider>
  )
}
