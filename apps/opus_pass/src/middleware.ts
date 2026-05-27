import { clerkMiddleware, createRouteMatcher } from '@clerk/nextjs/server'

// Couple dashboard lives under /my and requires a signed-in user.
const isProtectedRoute = createRouteMatcher(['/my(.*)'])

export default clerkMiddleware(async (auth, req) => {
  if (isProtectedRoute(req)) {
    await auth.protect({
      unauthenticatedUrl: new URL('/sign-in', req.url).toString(),
    })
  }
})

export const config = {
  matcher: [
    // Skip Next internals and static assets unless in search params
    '/((?!_next|[^?]*\\.(?:html?|css|js(?!on)|jpe?g|webp|png|gif|svg|ttf|woff2?|ico|csv|docx?|xlsx?|zip|webmanifest)).*)',
    // Always run for API routes
    '/(api|trpc)(.*)',
  ],
}
