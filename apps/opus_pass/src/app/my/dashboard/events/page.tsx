import { getEvents } from '@/lib/dashboard/queries'
import { getLocale } from '@/lib/cms/locale'
import { loadUiStrings } from '@/lib/cms/ui-strings'
import EventsManager from './EventsManager'

export const dynamic = 'force-dynamic'

export default async function EventsPage() {
  const events = await getEvents()
  const locale = await getLocale()
  const strings = await loadUiStrings('dashboard-events', locale)
  return <EventsManager initialEvents={events} strings={strings} />
}
