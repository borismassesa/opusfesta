import { createOpusFestaMiddleware } from "@opusfesta/auth/middleware";

export default createOpusFestaMiddleware([
  "/login",
  "/signup",
  "/forgot-password",
  "/reset-password",
  "/sso-callback",
]);

export const config = {
  matcher: [
    "/((?!_next|[^?]*\\.(?:html?|css|js(?!on)|jpe?g|webp|png|gif|svg|ttf|woff2?|ico|csv|docx?|xlsx?|zip|webmanifest)).*)",
    "/(api|trpc)(.*)",
  ],
};
