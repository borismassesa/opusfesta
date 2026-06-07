import { clerkMiddleware, createRouteMatcher } from '@clerk/nextjs/server'

// TEMPORARY: when DISABLE_ADMIN_AUTH=true the whole sign-in/role gate is
// bypassed so we can develop the dashboard without auth. The Clerk wiring is
// left fully intact — flip the flag (or remove it) to restore enforcement.
// Hard-gated to non-production builds so the flag can NEVER open the admin in
// prod even if the env var leaks into a deployed environment.
// See also getAdminAccessRole() in lib/admin-auth.ts.
const AUTH_DISABLED =
  process.env.DISABLE_ADMIN_AUTH === 'true' &&
  process.env.NODE_ENV !== 'production'

// TEMPORARY shared-passcode access (see lib/temp-admin.ts). A valid
// `of_temp_admin` cookie lets the team into the admin with full owner rights
// without Clerk. The cookie value is the shared code itself, compared here
// (edge runtime can't import the next/headers helper, so the constant +
// password are duplicated). Disable by setting ADMIN_TEMP_PASSWORD="".
const TEMP_ADMIN_COOKIE = 'of_temp_admin'
const TEMP_ADMIN_PASSWORD =
  process.env.ADMIN_TEMP_PASSWORD === undefined
    ? 'opusfesta-admin-2026'
    : process.env.ADMIN_TEMP_PASSWORD
const TEMP_ADMIN_ENABLED = TEMP_ADMIN_PASSWORD.length > 0

function hasTempAdminCookie(req: Request): boolean {
  if (!TEMP_ADMIN_ENABLED) return false
  const cookie = req.headers.get('cookie') ?? ''
  // Match the of_temp_admin cookie value without a full cookie parser.
  const match = cookie.match(/(?:^|;\s*)of_temp_admin=([^;]*)/)
  return match ? decodeURIComponent(match[1]) === TEMP_ADMIN_PASSWORD : false
}

// Public routes — sign-in/sign-up pages, Clerk's own callback handling, and
// webhook endpoints (which are authenticated by their own signing secrets).
const isPublicRoute = createRouteMatcher([
  '/sign-in(.*)',
  '/sign-up(.*)',
  // Shared temp-access passcode page — must render before any auth.
  '/temp-access(.*)',
  // Workforce invitation landing page renders before sign-in: if the
  // visitor is unauthenticated it bounces to /sign-up itself, preserving
  // the token in redirect_url. Routing it through Clerk's default redirect
  // would drop the token and break the acceptance flow.
  '/accept-invite(.*)',
  '/contribute/invite(.*)',
  '/api/webhooks/(.*)',
])

export default clerkMiddleware(
  async (auth, req) => {
    if (AUTH_DISABLED) return
    if (isPublicRoute(req)) return
    // Holders of the shared temp-access cookie skip the Clerk route guard.
    if (hasTempAdminCookie(req)) return
    await auth.protect({
      // Send unauthenticated visitors to the shared-passcode page when it's
      // enabled, otherwise to the normal Clerk sign-in.
      unauthenticatedUrl: new URL(
        TEMP_ADMIN_ENABLED ? '/temp-access' : '/sign-in',
        req.url,
      ).toString(),
    })
  },
  { signInUrl: '/sign-in' },
)

export const config = {
  matcher: [
    '/((?!_next|[^?]*\\.(?:html?|css|js(?!on)|jpe?g|webp|png|gif|svg|ttf|woff2?|ico|csv|docx?|xlsx?|zip|webmanifest)).*)',
    '/(api|trpc)(.*)',
  ],
}
