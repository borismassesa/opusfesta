import {
  getEvents,
  getPledges,
  pledgeStatsFrom,
  getGuestsWithInvitations,
  getCoupleProfile,
  coupleDisplayName,
  getMyPledgeToken,
  getMyPledgePageConfig,
  getEventOrderLinks,
  getEventPackageTierId,
  type PledgeScope,
} from '@/lib/dashboard/queries'
import { resolveEventScope } from '@/lib/dashboard/event-scope'
import { EventChooser } from '@/components/dashboard/EventScope'
import { loadDashboardHero } from '@/lib/cms/dashboard-hero'
import { loadDashboardCopy } from '@/lib/cms/dashboard-copy'
import { getLocale } from '@/lib/cms/locale'
import { loadUiStrings } from '@/lib/cms/ui-strings'
import { getWhatsAppProvider } from '@/lib/whatsapp'
import { getSmsProvider } from '@/lib/sms'
import { isEmailConfigured } from '@/lib/email'
import { loadInvitationProducts } from '@/lib/cms/invitations-products'
import PledgesManager from './PledgesManager'

/** How many catalog designs to offer as free pledge-card templates. */
const PLEDGE_CARD_CATALOG_SIZE = 10

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
  // couple's OLDEST event (by created_at, not display sort order — sort
  // order/starts_at can change via the Events editor, which would otherwise
  // silently move where these pledges are visible) so no money disappears.
  const oldestEventId = events.length
    ? events.reduce((oldest, e) =>
        new Date(e.created_at).getTime() < new Date(oldest.created_at).getTime() ? e : oldest,
      ).id
    : null
  const pledgeScope: PledgeScope = selectedEventId
    ? { eventId: selectedEventId, includeUnassigned: selectedEventId === oldestEventId }
    : {}

  const [pledges, guests, profile, pledgeToken, pledgePageConfig, orderLinks, copy, packageTierId, catalogProducts] =
    await Promise.all([
      getPledges(pledgeScope),
      getGuestsWithInvitations(),
      getCoupleProfile(),
      getMyPledgeToken(),
      getMyPledgePageConfig(),
      getEventOrderLinks(),
      loadDashboardCopy('pledges', locale),
      selectedEventId ? getEventPackageTierId(selectedEventId) : Promise.resolve(null),
      loadInvitationProducts(locale),
    ])
  // A curated slice of the invitation catalog, offered as ready-made pledge
  // page covers — Elegant/Signature couples can use any of these for free.
  const pledgeCardCatalog = catalogProducts
    .filter((p) => p.imageUrl)
    .slice(0, PLEDGE_CARD_CATALOG_SIZE)
    .map((p) => ({ id: p.id, name: p.name, imageUrl: p.imageUrl! }))
  const stats = pledgeStatsFrom(pledges)
  // The first paid card design (if any) linked to this event — offered as a
  // one-click pledge-card cover so couples don't have to buy a second design
  // just for the pledge page.
  const purchasedCard =
    (selectedEventId ? orderLinks.byEvent[selectedEventId] : undefined)?.find((o) => o.cardImageUrl) ?? null
  const hasUnassignedOrder = orderLinks.unassigned.length > 0
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
      pledgeCoverImageUrl={pledgePageConfig.coverImageUrl ?? null}
      pledgeCoverIsFullTemplate={pledgePageConfig.coverIsFullTemplate ?? false}
      purchasedCard={purchasedCard ? { cardName: purchasedCard.cardName, cardImageUrl: purchasedCard.cardImageUrl } : null}
      hasUnassignedOrder={hasUnassignedOrder}
      packageTierId={packageTierId}
      pledgeCardCatalog={pledgeCardCatalog}
      copy={copy}
      whatsappLive={getWhatsAppProvider().live}
      emailLive={isEmailConfigured()}
      smsLive={getSmsProvider().live}
    />
  )
}
