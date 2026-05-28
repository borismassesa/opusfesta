import {
  getGuestsWithInvitations,
  getCoupleProfile,
  coupleDisplayName,
  getDashboardHeroMedia,
} from '@/lib/dashboard/queries'
import InvitationsCenter from './InvitationsCenter'

export const dynamic = 'force-dynamic'

export default async function InvitationsPage() {
  const [guests, profile, hero] = await Promise.all([
    getGuestsWithInvitations(),
    getCoupleProfile(),
    getDashboardHeroMedia('invitations'),
  ])
  return (
    <InvitationsCenter guests={guests} coupleName={coupleDisplayName(profile)} hero={hero} />
  )
}
