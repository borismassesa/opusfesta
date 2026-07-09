// Plain constants shared by the server-side scope resolver (event-scope.ts,
// which pulls in next/headers) and the client-side chooser/switcher
// (components/dashboard/EventScope.tsx) — kept in their own file so the
// client bundle doesn't need to import a server-only module just for these.

export const ACTIVE_EVENT_COOKIE = 'op-active-event'

/** Sentinel for the roster-style pages that support a cross-event view. */
export const ALL_EVENTS = 'all'
