import { clerkMiddleware, createRouteMatcher } from '@clerk/nextjs/server'

// Public routes — sign-in/sign-up pages, Clerk's own callback handling, and
// webhook endpoints (which are authenticated by their own signing secrets).
const isPublicRoute = createRouteMatcher([
  '/sign-in(.*)',
  '/sign-up(.*)',
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
    if (isPublicRoute(req)) return
    await auth.protect({
      unauthenticatedUrl: new URL('/sign-in', req.url).toString(),
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
