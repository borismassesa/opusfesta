import { SettingsShell } from '@/components/dashboard/SettingsNav'
import { getPublicShareInfo } from '@/lib/dashboard/queries'
import { publicOrigin, inviteUrl } from '@/lib/dashboard/share'
import UrlsView from './UrlsView'

export const dynamic = 'force-dynamic'

export default async function UrlsSettingsPage() {
  const share = await getPublicShareInfo()
  const url = share.slug ? inviteUrl(publicOrigin(), share.slug) : null
  return (
    <SettingsShell>
      <UrlsView url={url} enabled={share.enabled} />
    </SettingsShell>
  )
}
