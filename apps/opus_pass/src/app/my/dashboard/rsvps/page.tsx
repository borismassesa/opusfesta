import { getGuestsWithInvitations, getEvents, getLastSendByGuest } from '@/lib/dashboard/queries'
import { loadDashboardHero } from '@/lib/cms/dashboard-hero'
import { loadDashboardCopy } from '@/lib/cms/dashboard-copy'
import RsvpTracker from './RsvpTracker'

export const dynamic = 'force-dynamic'

export default async function RsvpsPage() {
  const [guests, events, lastSend, hero, copy] = await Promise.all([
    getGuestsWithInvitations(),
    getEvents(),
    getLastSendByGuest(),
    loadDashboardHero('rsvps'),
    loadDashboardCopy('rsvps'),
  ])
  return <RsvpTracker guests={guests} events={events} lastSend={lastSend} hero={hero} copy={copy} />
}
