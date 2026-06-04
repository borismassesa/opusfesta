import { clerkMiddleware, createRouteMatcher } from '@clerk/nextjs/server'

const isPublicRoute = createRouteMatcher([
  '/',
  '/sign-in(.*)',
  '/sign-up(.*)',
  '/api/webhooks(.*)',
  // Phone-handoff identity capture — authorized by a signed token in the URL,
  // not a Clerk session (the phone scanning the QR isn't logged in).
  '/verify/capture(.*)',
])

export default clerkMiddleware(
  async (auth, req) => {
    if (isPublicRoute(req)) return
    const signInUrl = new URL('/sign-in', req.url)
    signInUrl.searchParams.set('redirect_url', req.url)
    await auth.protect({ unauthenticatedUrl: signInUrl.toString() })
  },
  { signInUrl: '/sign-in' },
)

export const config = {
  matcher: [
    '/((?!_next|[^?]*\\.(?:html?|css|js(?!on)|jpe?g|webp|png|gif|svg|ttf|woff2?|ico|csv|docx?|xlsx?|zip|webmanifest)).*)',
    '/(api|trpc)(.*)',
  ],
}
