import {
  clerkMiddleware,
  createRouteMatcher,
} from "@clerk/nextjs/server";

/**
 * Creates Clerk middleware for a Next.js app with the given public routes.
 */
export function createOpusFestaMiddleware(publicRoutes: string[]) {
  const isPublicRoute = createRouteMatcher(publicRoutes);

  return clerkMiddleware(async (auth, request) => {
    if (!isPublicRoute(request)) {
      const loginUrl = new URL("/login", request.url);
      loginUrl.searchParams.set("next", request.nextUrl.pathname);
      await auth.protect({ unauthenticatedUrl: loginUrl.toString() });
    }
  });
}

export { clerkMiddleware, createRouteMatcher };
