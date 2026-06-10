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

// Public routes — sign-in/sign-up pages, Clerk's own callback handling, and
// webhook endpoints (which are authenticated by their own signing secrets).
const isPublicRoute = createRouteMatcher([
  '/sign-in(.*)',
  '/sign-up(.*)',
  '/auth-callback(.*)',
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
    await auth.protect()
  },
  { signInUrl: '/sign-in' },
)

export const config = {
  matcher: [
    '/((?!_next|[^?]*\\.(?:html?|css|js(?!on)|jpe?g|webp|png|gif|svg|ttf|woff2?|ico|csv|docx?|xlsx?|zip|webmanifest)).*)',
    '/(api|trpc)(.*)',
  ],
}
