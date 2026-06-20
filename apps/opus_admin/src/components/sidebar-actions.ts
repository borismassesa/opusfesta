'use server'

import { cookies } from 'next/headers'
import { auth, clerkClient } from '@clerk/nextjs/server'

// Legacy shared-passcode cookie from the retired temp-access feature. Cleared
// defensively on logout so any lingering value is dropped — it no longer grants
// anything (the auth layer stopped honoring it when temp-access was removed).
const LEGACY_TEMP_ADMIN_COOKIE = 'of_temp_admin'

/**
 * Sign the admin out entirely server-side — so the sidebar never has to call
 * Clerk's `useClerk()` hook (which throws when the Clerk React context isn't an
 * ancestor of the admin layout's SSR tree).
 *
 * Revokes the active Clerk session on Clerk's servers (proper logout), then
 * clears Clerk's session cookies (and the legacy passcode cookie) so the next
 * request is treated as signed-out. The caller then navigates to /sign-in.
 * Best-effort: a missing session / unconfigured Clerk is a no-op.
 */
export async function adminSignOut(): Promise<void> {
  const jar = await cookies()
  jar.delete(LEGACY_TEMP_ADMIN_COOKIE)

  try {
    const { sessionId } = await auth()
    if (sessionId) {
      const client = await clerkClient()
      await client.sessions.revokeSession(sessionId)
    }
  } catch {
    // No Clerk session, or Clerk not configured — cookie clearing below still
    // ends the local session.
  }

  // Clerk's session cookies (dev + prod). Deleting them locally ends the session
  // for this app regardless of the revoke call above.
  for (const name of ['__session', '__client_uat', '__clerk_db_jwt']) {
    jar.delete(name)
  }
}
