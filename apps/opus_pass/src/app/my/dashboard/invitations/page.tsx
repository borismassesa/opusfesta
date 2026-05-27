import { getGuestsWithInvitations, getCoupleProfile, coupleDisplayName } from '@/lib/dashboard/queries'
import InvitationsCenter from './InvitationsCenter'

export const dynamic = 'force-dynamic'

export default async function InvitationsPage() {
  const [guests, profile] = await Promise.all([getGuestsWithInvitations(), getCoupleProfile()])
  return <InvitationsCenter guests={guests} coupleName={coupleDisplayName(profile)} />
}
