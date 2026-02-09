import { createOpusFestaMiddleware } from "@opusfesta/auth/middleware";

// Website is mostly public - only protect user-specific routes
export default createOpusFestaMiddleware([
  "/",
  "/login",
  "/signup",
  "/forgot-password",
  "/reset-password",
  "/sso-callback",
  "/vendors",
  "/vendors/(.*)",
  "/planning",
  "/planning/(.*)",
  "/advice-ideas",
  "/advice-ideas/(.*)",
  "/careers",
  "/careers/(.*)",
  "/api/webhooks/(.*)",
  "/api/advice-ideas/(.*)",
  "/api/vendors/collections/(.*)",
  "/api/vendors/statistics",
  "/api/vendors",
  "/api/vendors/(.*)/reviews",
  "/api/cms/(.*)",
  "/api/careers/jobs",
  "/api/careers/jobs/(.*)",
]);

export const config = {
  matcher: [
    "/((?!_next|[^?]*\\.(?:html?|css|js(?!on)|jpe?g|webp|png|gif|svg|ttf|woff2?|ico|csv|docx?|xlsx?|zip|webmanifest)).*)",
    "/(api|trpc)(.*)",
  ],
};
