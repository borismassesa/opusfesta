'use server'

import { cookies, headers } from 'next/headers'
import { auth, clerkClient } from '@clerk/nextjs/server'

// Legacy shared-passcode cookie from the retired temp-access feature. Cleared
// defensively on logout so any lingering value is dropped — it no longer grants
// anything (the auth layer stopped honoring it when temp-access was removed).
const LEGACY_TEMP_ADMIN_COOKIE = 'of_temp_admin'

// Clerk's session cookies (dev + prod).
const CLERK_SESSION_COOKIES = ['__session', '__client_uat', '__clerk_db_jwt']

// Derive the registrable apex (admin.opusfesta.com -> opusfesta.com) so we can
// also expire cookies Clerk scoped to the shared apex domain. In production the
// whole ecosystem shares one Clerk instance across *.opusfesta.com, so Clerk
// sets __client_uat / __session with Domain=.opusfesta.com — a host-scoped
// delete from a subdomain does NOT overwrite those. Returns null for localhost /
// IPs / bare hosts, where cookies are host-scoped anyway and the plain delete
// suffices.
function apexDomainFromHost(host: string | null): string | null {
  if (!host) return null
  const hostname = host.split(':')[0] // strip any :port
  if (hostname === 'localhost' || /^[\d.]+$/.test(hostname)) return null
  const labels = hostname.split('.')
  if (labels.length < 2) return null
  return labels.slice(-2).join('.') // opusfesta.com
}

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

  // Clear Clerk's session cookies. Deleting them locally ends the session for
  // this app regardless of the revoke call above.
  const apex = apexDomainFromHost((await headers()).get('host'))
  for (const name of CLERK_SESSION_COOKIES) {
    // Host-scoped delete (covers localhost + the exact subdomain).
    jar.delete(name)
    // Apex-scoped expiry — Clerk sets these with Domain=.opusfesta.com in prod,
    // which the host-scoped delete above can't reach. No-op when there's no apex.
    if (apex) {
      jar.set(name, '', { domain: `.${apex}`, path: '/', maxAge: 0 })
    }
  }
}
