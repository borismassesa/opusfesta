import { getSendInvitesData } from '@/lib/dashboard/queries'
import { getLocale } from '@/lib/cms/locale'
import { loadUiStrings } from '@/lib/cms/ui-strings'
import SendInvitesView from './SendInvitesView'

export const dynamic = 'force-dynamic'

export default async function InvitationsPage() {
  const data = await getSendInvitesData()
  const locale = await getLocale()
  const strings = await loadUiStrings('dashboard-send', locale)
  return <SendInvitesView data={data} strings={strings} />
}
