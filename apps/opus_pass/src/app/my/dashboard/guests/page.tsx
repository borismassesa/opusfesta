import { getGuestsWithInvitations, getEvents } from '@/lib/dashboard/queries'
import GuestsManager from './GuestsManager'

export const dynamic = 'force-dynamic'

export default async function GuestsPage() {
  const [guests, events] = await Promise.all([getGuestsWithInvitations(), getEvents()])
  return <GuestsManager initialGuests={guests} events={events} />
}
