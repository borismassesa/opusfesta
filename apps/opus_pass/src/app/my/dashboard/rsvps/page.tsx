import {
  getGuestsWithInvitations,
  getEvents,
  getDashboardHeroMedia,
} from '@/lib/dashboard/queries'
import RsvpTracker from './RsvpTracker'

export const dynamic = 'force-dynamic'

export default async function RsvpsPage() {
  const [guests, events, hero] = await Promise.all([
    getGuestsWithInvitations(),
    getEvents(),
    getDashboardHeroMedia('rsvps'),
  ])
  return <RsvpTracker guests={guests} events={events} hero={hero} />
}
