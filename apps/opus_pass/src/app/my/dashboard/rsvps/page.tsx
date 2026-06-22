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
import RsvpsClient from './RsvpsClient'

export const dynamic = 'force-dynamic'

export default async function RsvpsPage() {
  const locale = await getLocale()
  const [guests, events, lastSend, questions, summaries, answerSummaries, publicInvite, hero, copy] =
    await Promise.all([
      getGuestsWithInvitations(),
      getEvents(),
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
