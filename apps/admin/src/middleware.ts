import { createOpusFestaMiddleware } from "@opusfesta/auth/middleware";

export default createOpusFestaMiddleware([
  "/login",
  "/forgot-password",
  "/reset-password",
  "/api/admin/whitelist/check",
]);

export const config = {
  matcher: [
    "/((?!_next|[^?]*\\.(?:html?|css|js(?!on)|jpe?g|webp|png|gif|svg|ttf|woff2?|ico|csv|docx?|xlsx?|zip|webmanifest)).*)",
    "/(api|trpc)(.*)",
  ],
};
