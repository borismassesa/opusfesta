// Plain constants shared by the server queries and the client console.
// Deliberately NOT in queries.ts: that file is `import 'server-only'`, and a
// client component importing a value out of it breaks the Turbopack prod
// build (types are erased and stay safe, values are not).

/** How many invitations the console's guest table loads for one event.
 *  PostgREST caps responses at 1000 rows, so this stays comfortably under it
 *  and the UI says "showing first N" instead of silently truncating. The
 *  exact totals on the event cards come from couple_event_stats. */
export const GUEST_PAGE_SIZE = 500
