import {
  getGuestsWithInvitations,
  getEvents,
  getLastSendByGuest,
  getRsvpQuestions,
  getRsvpEventSummaries,
  getRsvpAnswerSummaries,
  getMyPublicInvite,
} from '@/lib/dashboard/queries'
import { loadDashboardHero } from '@/lib/cms/dashboard-hero'
import { loadDashboardCopy } from '@/lib/cms/dashboard-copy'
import { getLocale } from '@/lib/cms/locale'
import { loadUiStrings } from '@/lib/cms/ui-strings'
import { resolveEventScope, ALL_EVENTS } from '@/lib/dashboard/event-scope'
import { EventChooser } from '@/components/dashboard/EventScope'
import RsvpsClient from './RsvpsClient'

export const dynamic = 'force-dynamic'

export default async function RsvpsPage({
  searchParams,
}: {
  searchParams: Promise<{ event?: string }>
}) {
  const { event: eventParam } = await searchParams
  const locale = await getLocale()

  // Multi-event couples choose a scope up front (a single event, or the
  // combined view); the tracker filter then starts on that choice.
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

  const [guests, lastSend, questions, summaries, answerSummaries, publicInvite, hero, copy] =
    await Promise.all([
      getGuestsWithInvitations(),
      getLastSendByGuest(),
      getRsvpQuestions(),
      getRsvpEventSummaries(),
      getRsvpAnswerSummaries(),
      getMyPublicInvite(),
      loadDashboardHero('rsvps', locale),
      loadDashboardCopy('rsvps', locale),
    ])
  return (
    <RsvpsClient
      guests={guests}
      events={events}
      initialEventFilter={scope.isAll ? ALL_EVENTS : (scope.selected?.id ?? ALL_EVENTS)}
      lastSend={lastSend}
      hero={hero}
      copy={copy}
      questions={questions}
      summaries={summaries}
      answerSummaries={answerSummaries}
      publicInvite={publicInvite}
    />
  )
}
