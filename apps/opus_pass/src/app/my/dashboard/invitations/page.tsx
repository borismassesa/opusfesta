import { getSendInvitesData } from '@/lib/dashboard/queries'
import SendInvitesView from './SendInvitesView'

export const dynamic = 'force-dynamic'

export default async function InvitationsPage() {
  const data = await getSendInvitesData()
  return <SendInvitesView data={data} />
}
