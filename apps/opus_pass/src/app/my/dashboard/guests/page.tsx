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
import { getWhatsAppProvider } from '@/lib/whatsapp'
import GuestsManager from './GuestsManager'
import ReviewQueue from './ReviewQueue'

export const dynamic = 'force-dynamic'

export default async function GuestsPage() {
  const locale = await getLocale()
  const [guests, events, profile, hero, collectorToken, copy] = await Promise.all([
    getGuestsWithInvitations(),
    getEvents(),
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
        coupleName={coupleDisplayName(profile)}
        hero={hero}
        collectorToken={collectorToken}
        copy={copy}
        whatsappLive={getWhatsAppProvider().live}
      />
    </>
  )
}
