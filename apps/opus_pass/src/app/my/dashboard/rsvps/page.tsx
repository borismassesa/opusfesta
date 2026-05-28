import { getGuestsWithInvitations, getEvents } from '@/lib/dashboard/queries'
import { loadDashboardHero } from '@/lib/cms/dashboard-hero'
import RsvpTracker from './RsvpTracker'

export const dynamic = 'force-dynamic'

export default async function RsvpsPage() {
  const [guests, events, hero] = await Promise.all([
    getGuestsWithInvitations(),
    getEvents(),
    loadDashboardHero('rsvps'),
  ])
  return <RsvpTracker guests={guests} events={events} hero={hero} />
}
