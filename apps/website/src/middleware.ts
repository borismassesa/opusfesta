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
  "/websites",
  "/websites/(.*)",
  "/planning",
  "/planning/(.*)",
  "/planning-tools",
  "/planning-tools/(.*)",
  "/attireandrings",
  "/advice-and-ideas",
  "/advice-and-ideas/(.*)",
  "/careers",
  "/careers/(.*)",
  "/api/webhooks/(.*)",
  "/api/advice-ideas/(.*)",
  "/api/vendors",
  "/api/vendors/(.*)",
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
