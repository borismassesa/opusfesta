import {
  getGuestsWithInvitations,
  getEvents,
  getCoupleProfile,
  coupleDisplayName,
  getDashboardHeroMedia,
  getMyCollectorToken,
} from '@/lib/dashboard/queries'
import GuestsManager from './GuestsManager'

export const dynamic = 'force-dynamic'

export default async function GuestsPage() {
  const [guests, events, profile, hero, collectorToken] = await Promise.all([
    getGuestsWithInvitations(),
    getEvents(),
    getCoupleProfile(),
    getDashboardHeroMedia('guests'),
    getMyCollectorToken(),
  ])
  return (
    <GuestsManager
      initialGuests={guests}
      events={events}
      coupleName={coupleDisplayName(profile)}
      hero={hero}
      collectorToken={collectorToken}
    />
  )
}
