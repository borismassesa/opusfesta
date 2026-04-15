import { clerkMiddleware, createRouteMatcher } from '@clerk/nextjs/server'
import { NextResponse } from 'next/server'

const SESSION_COOKIE = 'of_client_session'

const isAdminRoute = createRouteMatcher(['/studio-admin(.*)', '/api/admin(.*)'])
const isPortalProtectedRoute = createRouteMatcher([
  '/portal',
  '/portal/settings(.*)',
  '/portal/bookings(.*)',
  '/portal/messages(.*)',
  '/portal/book(.*)',
  '/api/portal(.*)',
])
const isBookingRoute = createRouteMatcher(['/book(.*)'])
const isPublicRoute = createRouteMatcher([
  '/',
  '/portfolio(.*)',
  '/journal(.*)',
  '/services(.*)',
  '/about(.*)',
  '/contact(.*)',
  '/privacy',
  '/terms',
  '/api/booking(.*)',
  '/api/client-auth(.*)',
  '/api/webhooks/flutterwave',
  '/portal/login(.*)',
  '/portal/signup(.*)',
  '/sign-in(.*)',
  '/no-access',
])

export default clerkMiddleware(async (auth, req) => {
  if (isPublicRoute(req)) return NextResponse.next()

  if (isAdminRoute(req)) {
    await auth.protect()
    return
  }

  // Portal and booking routes use magic-link session cookie — Clerk not involved
  if (isPortalProtectedRoute(req) || isBookingRoute(req)) {
    const sessionToken = req.cookies.get(SESSION_COOKIE)?.value
    if (!sessionToken) {
      const signInUrl = new URL('/portal/login', req.url)
      signInUrl.searchParams.set('redirect_url', req.url)
      return NextResponse.redirect(signInUrl)
    }
    return NextResponse.next()
  }
})

export const config = {
  matcher: [
    '/((?!_next|[^?]*\\.(?:html?|css|js(?!on)|jpe?g|webp|png|gif|svg|ttf|woff2?|ico|csv|docx?|xlsx?|zip|webmanifest)).*)',
    '/(api|trpc)(.*)',
  ],
}
