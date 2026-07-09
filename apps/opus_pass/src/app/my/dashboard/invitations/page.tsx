import { getEvents, getSendInvitesData } from '@/lib/dashboard/queries'
import { resolveEventScope } from '@/lib/dashboard/event-scope'
import { EventChooser } from '@/components/dashboard/EventScope'
import { getLocale } from '@/lib/cms/locale'
import { loadUiStrings } from '@/lib/cms/ui-strings'
import SendInvitesView from './SendInvitesView'

export const dynamic = 'force-dynamic'

export default async function InvitationsPage({
  searchParams,
}: {
  searchParams: Promise<{ event?: string }>
}) {
  const { event: eventParam } = await searchParams
  const locale = await getLocale()

  // Multi-event couples pick which event they're sending for before the
  // send console loads; the choice then follows them via ?event= + cookie.
  const events = await getEvents()
  const scope = await resolveEventScope(events, eventParam)
  if (scope.needsChooser) {
    const scopeStrings = await loadUiStrings('dashboard-event-scope', locale)
    return (
      <div className="space-y-6">
        <EventChooser events={events} strings={scopeStrings} />
      </div>
    )
  }

  const [data, strings] = await Promise.all([
    getSendInvitesData(scope.selected?.id, events),
    loadUiStrings('dashboard-send', locale),
  ])
  return <SendInvitesView data={data} strings={strings} />
}
