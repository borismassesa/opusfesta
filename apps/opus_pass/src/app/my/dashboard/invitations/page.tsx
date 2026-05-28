import {
  getGuestsWithInvitations,
  getCoupleProfile,
  coupleDisplayName,
} from '@/lib/dashboard/queries'
import { loadDashboardHero } from '@/lib/cms/dashboard-hero'
import InvitationsCenter from './InvitationsCenter'

export const dynamic = 'force-dynamic'

export default async function InvitationsPage() {
  const [guests, profile, hero] = await Promise.all([
    getGuestsWithInvitations(),
    getCoupleProfile(),
    loadDashboardHero('invitations'),
  ])
  return (
    <InvitationsCenter guests={guests} coupleName={coupleDisplayName(profile)} hero={hero} />
  )
}
