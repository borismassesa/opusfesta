import { clerkMiddleware, createRouteMatcher } from '@clerk/nextjs/server';
import { NextResponse } from 'next/server';

const isAdminRoute = createRouteMatcher(['/admin(.*)', '/studio-admin(.*)', '/api/admin(.*)']);
const isPublicRoute = createRouteMatcher([
  '/',
  '/portfolio(.*)',
  '/journal(.*)',
  '/services(.*)',
  '/about(.*)',
  '/contact(.*)',
  '/privacy',
  '/terms',
  '/api/booking',
  '/admin/sign-in(.*)',
  '/studio-admin/sign-in(.*)',
]);

export default clerkMiddleware(async (auth, req) => {
  if (isPublicRoute(req)) {
    return NextResponse.next();
  }

  if (isAdminRoute(req)) {
    await auth.protect();
  }
});

export const config = {
  matcher: [
    '/((?!_next|[^?]*\\.(?:html?|css|js(?!on)|jpe?g|webp|png|gif|svg|ttf|woff2?|ico|csv|docx?|xlsx?|zip|webmanifest)).*)',
    '/(api|trpc)(.*)',
  ],
};
