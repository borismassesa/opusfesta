import { getGuestsWithInvitations, getEvents } from '@/lib/dashboard/queries'
import RsvpTracker from './RsvpTracker'

export const dynamic = 'force-dynamic'

export default async function RsvpsPage() {
  const [guests, events] = await Promise.all([getGuestsWithInvitations(), getEvents()])
  return <RsvpTracker guests={guests} events={events} />
}
