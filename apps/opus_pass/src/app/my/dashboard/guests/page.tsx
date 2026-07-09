import {
  getGuestsWithInvitations,
  getEvents,
  getCoupleProfile,
  coupleDisplayName,
  getMyCollectorToken,
} from '@/lib/dashboard/queries'
import { loadDashboardHero } from '@/lib/cms/dashboard-hero'
import { loadDashboardCopy } from '@/lib/cms/dashboard-copy'
import { getLocale } from '@/lib/cms/locale'
import { loadUiStrings } from '@/lib/cms/ui-strings'
import { resolveEventScope, ALL_EVENTS } from '@/lib/dashboard/event-scope'
import { EventChooser } from '@/components/dashboard/EventScope'
import { getWhatsAppProvider } from '@/lib/whatsapp'
import GuestsManager from './GuestsManager'
import ReviewQueue from './ReviewQueue'

export const dynamic = 'force-dynamic'

export default async function GuestsPage({
  searchParams,
}: {
  searchParams: Promise<{ event?: string }>
}) {
  const { event: eventParam } = await searchParams
  const locale = await getLocale()

  // Multi-event couples choose a scope up front: one event's roster, or the
  // full list (guests are shared across events and linked per event).
  const events = await getEvents()
  const scope = await resolveEventScope(events, eventParam, { allowAll: true })
  const scopeStrings = await loadUiStrings('dashboard-event-scope', locale)
  if (scope.needsChooser) {
    return (
      <div className="space-y-6">
        <EventChooser events={events} strings={scopeStrings} allowAll />
      </div>
    )
  }

  const [guests, profile, hero, collectorToken, copy] = await Promise.all([
    getGuestsWithInvitations(),
    getCoupleProfile(),
    loadDashboardHero('guests', locale),
    getMyCollectorToken(),
    loadDashboardCopy('guests', locale),
  ])

  // Public self-RSVPs sit in a review queue until the host approves them, so
  // keep them out of the main roster — a forwarded link can't silently pad the
  // guest list.
  const awaitingReview = guests.filter((g) => g.review_status === 'unconfirmed')
  const confirmedGuests = guests.filter((g) => g.review_status !== 'unconfirmed')

  return (
    <>
      <ReviewQueue initial={awaitingReview} />
      <GuestsManager
        initialGuests={confirmedGuests}
        events={events}
        eventFilter={scope.isAll ? ALL_EVENTS : (scope.selected?.id ?? ALL_EVENTS)}
        scopeStrings={scopeStrings}
        coupleName={coupleDisplayName(profile)}
        hero={hero}
        collectorToken={collectorToken}
        copy={copy}
        whatsappLive={getWhatsAppProvider().live}
      />
    </>
  )
}
