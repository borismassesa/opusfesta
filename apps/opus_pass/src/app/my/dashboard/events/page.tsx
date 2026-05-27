import { getEvents } from '@/lib/dashboard/queries'
import EventsManager from './EventsManager'

export const dynamic = 'force-dynamic'

export default async function EventsPage() {
  const events = await getEvents()
  return <EventsManager initialEvents={events} />
}
