import {
  getEvents,
  getPledges,
  pledgeStatsFrom,
  getGuestsWithInvitations,
  getCoupleProfile,
  coupleDisplayName,
  getMyPledgeToken,
  type PledgeScope,
} from '@/lib/dashboard/queries'
import { resolveEventScope } from '@/lib/dashboard/event-scope'
import { EventChooser } from '@/components/dashboard/EventScope'
import { loadDashboardHero } from '@/lib/cms/dashboard-hero'
import { loadDashboardCopy } from '@/lib/cms/dashboard-copy'
import { getLocale } from '@/lib/cms/locale'
import { loadUiStrings } from '@/lib/cms/ui-strings'
import { getWhatsAppProvider } from '@/lib/whatsapp'
import PledgesManager from './PledgesManager'

export const dynamic = 'force-dynamic'

export default async function PledgesPage({
  searchParams,
}: {
  searchParams: Promise<{ event?: string }>
}) {
  const { event: eventParam } = await searchParams
  const locale = await getLocale()
  const [events, scopeStrings, hero] = await Promise.all([
    getEvents(),
    loadUiStrings('dashboard-event-scope', locale),
    loadDashboardHero('pledges', locale),
  ])

  // Multi-event couples pick which event's pledge book they're working on
  // before anything loads; the choice then follows them via ?event= + cookie.
  const scope = await resolveEventScope(events, eventParam)
  if (scope.needsChooser) {
    return (
      <div className="space-y-6">
        <EventChooser events={events} strings={scopeStrings} />
      </div>
    )
  }

  const selectedEventId = scope.selected?.id ?? null
  // Legacy pledges (recorded before events existed) surface under the
  // couple's default (first) event so no money silently disappears.
  const pledgeScope: PledgeScope = selectedEventId
    ? { eventId: selectedEventId, includeUnassigned: selectedEventId === events[0]?.id }
    : {}

  const [pledges, guests, profile, pledgeToken, copy] = await Promise.all([
    getPledges(pledgeScope),
    getGuestsWithInvitations(),
    getCoupleProfile(),
    getMyPledgeToken(),
    loadDashboardCopy('pledges', locale),
  ])
  const stats = pledgeStatsFrom(pledges)
  return (
    <PledgesManager
      initialPledges={pledges}
      stats={stats}
      events={events.map((e) => ({ id: e.id, name: e.name }))}
      selectedEventId={selectedEventId}
      scopeStrings={scopeStrings}
      contacts={guests.map((g) => ({
        id: g.id,
        full_name: g.full_name,
        phone: g.phone,
        whatsapp_phone: g.whatsapp_phone,
        email: g.email,
      }))}
      coupleName={coupleDisplayName(profile)}
      paymentInstructions={profile?.pledge_payment_instructions ?? null}
      paymentMethods={profile?.pledge_payment_methods ?? []}
      goalAmount={profile?.pledge_goal_amount ?? null}
      weddingDate={profile?.wedding_date ?? null}
      hero={hero}
      pledgeToken={pledgeToken}
      copy={copy}
      whatsappLive={getWhatsAppProvider().live}
    />
  )
}
