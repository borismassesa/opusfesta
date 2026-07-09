// Server-side resolution of "which event is the couple working on?" for the
// event-scoped dashboard pages (Pledges, Send invites, Guest list, RSVPs,
// Seat collection). The selection travels as a `?event=<id>` search param
// (source of truth for the page) with a long-lived cookie as the cross-page
// default, so a couple picks an event once and every section opens on it.
// Client components write the cookie via setActiveEventCookie in
// @/components/dashboard/EventScope.

import { cookies } from 'next/headers'
import type { WeddingEvent } from './types'
import { ACTIVE_EVENT_COOKIE, ALL_EVENTS } from './event-scope-constants'

export { ACTIVE_EVENT_COOKIE, ALL_EVENTS }

export interface EventScope {
  /** The event the page should scope to, when exactly one is selected. */
  selected: WeddingEvent | null
  /** True when the user chose the "All events" view (only where allowed). */
  isAll: boolean
  /**
   * True when the couple has 2+ events and nothing valid is selected — the
   * page should render the event chooser instead of its content.
   */
  needsChooser: boolean
}

export async function resolveEventScope(
  events: WeddingEvent[],
  param: string | undefined,
  opts: { allowAll?: boolean } = {},
): Promise<EventScope> {
  const allowAll = opts.allowAll ?? false

  if (events.length === 0) return { selected: null, isAll: false, needsChooser: false }
  if (events.length === 1) return { selected: events[0], isAll: false, needsChooser: false }

  const jar = await cookies()
  const cookieValue = jar.get(ACTIVE_EVENT_COOKIE)?.value

  // URL param wins; the cookie is only the default for pages opened bare.
  for (const candidate of [param, cookieValue]) {
    if (!candidate) continue
    if (candidate === ALL_EVENTS && allowAll) return { selected: null, isAll: true, needsChooser: false }
    const match = events.find((e) => e.id === candidate)
    if (match) return { selected: match, isAll: false, needsChooser: false }
  }

  return { selected: null, isAll: false, needsChooser: true }
}
