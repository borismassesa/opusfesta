import { getEvents, getGiftRegistryClaims, getGiftRegistryHero, getGiftRegistryItems, getGuestCount, getMyPublicInvite } from '@/lib/dashboard/queries'
import { resolveEventScope } from '@/lib/dashboard/event-scope'
import { EventChooser } from '@/components/dashboard/EventScope'
import { getLocale } from '@/lib/cms/locale'
import { loadUiStrings } from '@/lib/cms/ui-strings'
import GiftRegistryManager from './GiftRegistryManager'

export const dynamic = 'force-dynamic'

export const metadata = {
  title: 'Gift registry',
}

export default async function GiftRegistryPage({
  searchParams,
}: {
  searchParams: Promise<{ event?: string }>
}) {
  const { event: eventParam } = await searchParams
  const locale = await getLocale()
  const [events, scopeStrings] = await Promise.all([getEvents(), loadUiStrings('dashboard-event-scope', locale)])

  // Multi-event couples pick which event's registry they're working on before
  // anything loads; the choice then follows them via ?event= + cookie, same
  // as Pledges/Guests/RSVPs/Seating.
  const scope = await resolveEventScope(events, eventParam)
  if (scope.needsChooser) {
    return (
      <div className="space-y-6">
        <EventChooser events={events} strings={scopeStrings} />
      </div>
    )
  }

  const selectedEventId = scope.selected?.id ?? null
  const [items, invite, heroBase, guestCount, claims] = await Promise.all([
    getGiftRegistryItems(selectedEventId),
    getMyPublicInvite(),
    getGiftRegistryHero(),
    getGuestCount(),
    getGiftRegistryClaims(selectedEventId),
  ])
  // The link is built client-side from window.location.origin (see
  // ShareLinkCard) rather than a server-computed origin, so it resolves to
  // localhost while developing instead of always pointing at production.
  return (
    <GiftRegistryManager
      initial={items}
      shareSlug={invite.slug}
      shareEnabled={invite.enabled}
      hero={{ ...heroBase, eventDate: scope.selected?.starts_at ?? null }}
      guestCount={guestCount}
      initialClaims={claims}
      events={events.map((e) => ({ id: e.id, name: e.name }))}
      selectedEventId={selectedEventId}
      scopeStrings={scopeStrings}
    />
  )
}
