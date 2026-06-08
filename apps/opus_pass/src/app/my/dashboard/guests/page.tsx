import {
  getGuestsWithInvitations,
  getEvents,
  getCoupleProfile,
  coupleDisplayName,
  getMyCollectorToken,
} from '@/lib/dashboard/queries'
import { loadDashboardHero } from '@/lib/cms/dashboard-hero'
import { loadDashboardCopy } from '@/lib/cms/dashboard-copy'
import GuestsManager from './GuestsManager'

export const dynamic = 'force-dynamic'

export default async function GuestsPage() {
  const [guests, events, profile, hero, collectorToken, copy] = await Promise.all([
    getGuestsWithInvitations(),
    getEvents(),
    getCoupleProfile(),
    loadDashboardHero('guests'),
    getMyCollectorToken(),
    loadDashboardCopy('guests'),
  ])
  return (
    <GuestsManager
      initialGuests={guests}
      events={events}
      coupleName={coupleDisplayName(profile)}
      hero={hero}
      collectorToken={collectorToken}
      copy={copy}
    />
  )
}
