import { getLocale } from '@/lib/cms/locale'
import { loadPortalUiStrings } from '@/lib/cms/portal-ui'
import { PortalUIStringsProvider } from '@/components/providers/PortalUIStringsProvider'
import TeamClient from './TeamClient'

export default async function TeamPage() {
  const locale = await getLocale()
  const photosTeamStrings = await loadPortalUiStrings('storefront-photos-team', locale)
  return (
    <PortalUIStringsProvider bundles={{ 'storefront-photos-team': photosTeamStrings }}>
      <TeamClient />
    </PortalUIStringsProvider>
  )
}
