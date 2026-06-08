import { getGuestsWithInvitations, getEvents } from '@/lib/dashboard/queries'
import { loadDashboardHero } from '@/lib/cms/dashboard-hero'
import { loadDashboardCopy } from '@/lib/cms/dashboard-copy'
import RsvpTracker from './RsvpTracker'

export const dynamic = 'force-dynamic'

export default async function RsvpsPage() {
  const [guests, events, hero, copy] = await Promise.all([
    getGuestsWithInvitations(),
    getEvents(),
    loadDashboardHero('rsvps'),
    loadDashboardCopy('rsvps'),
  ])
  return <RsvpTracker guests={guests} events={events} hero={hero} copy={copy} />
}
