import { getGuestsWithInvitations, getEvents, getLastSendByGuest } from '@/lib/dashboard/queries'
import { loadDashboardHero } from '@/lib/cms/dashboard-hero'
import { loadDashboardCopy } from '@/lib/cms/dashboard-copy'
import { getLocale } from '@/lib/cms/locale'
import RsvpTracker from './RsvpTracker'

export const dynamic = 'force-dynamic'

export default async function RsvpsPage() {
  const locale = await getLocale()
  const [guests, events, lastSend, hero, copy] = await Promise.all([
    getGuestsWithInvitations(),
    getEvents(),
    getLastSendByGuest(),
    loadDashboardHero('rsvps', locale),
    loadDashboardCopy('rsvps', locale),
  ])
  return <RsvpTracker guests={guests} events={events} lastSend={lastSend} hero={hero} copy={copy} />
}
