import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { createClient } from "@supabase/supabase-js";

/**
 * Get Supabase admin client for server-side operations
 */
function getSupabaseAdmin() {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

  if (!supabaseUrl || !serviceRoleKey) {
    throw new Error("Missing required Supabase environment variables");
  }

  return createClient(supabaseUrl, serviceRoleKey, {
    auth: {
      autoRefreshToken: false,
      persistSession: false,
    },
  });
}

/**
 * Public routes that don't require authentication
 */
const PUBLIC_ROUTES = [
  "/",
  "/login",
  "/signup",
  "/forgot-password",
  "/reset-password",
  "/verify-email",
  "/verify-reset-code",
  "/auth/callback",
  "/auth/error",
  "/vendors",
  "/vendors/[slug]",
  "/planning",
  "/advice-and-ideas",
  "/advice-and-ideas/[slug]",
  "/careers",
  "/careers/[id]",
  "/careers/positions",
  "/careers/benefits",
  "/careers/why-opusfesta",
  "/careers/how-we-hire",
  "/careers/life-at-opusfesta",
  "/careers/students",
  "/terms",
  "/privacy",
];

/**
 * Protected routes that require authentication
 */
const PROTECTED_ROUTES = [
  "/vendors/saved",
  "/my-inquiries",
  "/inquiries/[id]",
  "/careers/my-applications",
  "/careers/[id]/apply",
  "/vendor-portal",
  "/admin",
];

/**
 * Check if a path matches a route pattern (supports dynamic routes)
 */
function matchesRoute(path: string, pattern: string): boolean {
  // Convert Next.js dynamic route pattern to regex
  const regexPattern = pattern
    .replace(/\[([^\]]+)\]/g, "[^/]+") // Replace [slug] with [^/]+
    .replace(/\//g, "\\/"); // Escape slashes

  const regex = new RegExp(`^${regexPattern}$`);
  return regex.test(path);
}

/**
 * Check if route is public
 */
function isPublicRoute(path: string): boolean {
  // Remove query params and hash
  const normalizedPath = path.split("?")[0].split("#")[0];

  return PUBLIC_ROUTES.some((route) => matchesRoute(normalizedPath, route));
}

/**
 * Check if route is protected
 */
function isProtectedRoute(path: string): boolean {
  // Remove query params and hash
  const normalizedPath = path.split("?")[0].split("#")[0];

  return PROTECTED_ROUTES.some((route) => matchesRoute(normalizedPath, route));
}

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Skip middleware for:
  // - Static files
  // - API routes (they handle their own auth)
  // - _next files
  // - Public assets
  if (
    pathname.startsWith("/_next") ||
    pathname.startsWith("/api") ||
    pathname.startsWith("/static") ||
    pathname.match(/\.(ico|png|jpg|jpeg|svg|gif|webp|css|js|woff|woff2|ttf|eot)$/)
  ) {
    return NextResponse.next();
  }

  // Allow public routes
  if (isPublicRoute(pathname)) {
    return NextResponse.next();
  }

  // Check protected routes
  if (isProtectedRoute(pathname)) {
    // Get auth token from cookies or Authorization header
    const authHeader = request.headers.get("authorization");
    const accessToken =
      authHeader?.replace("Bearer ", "") ||
      request.cookies.get("sb-access-token")?.value;

    if (!accessToken) {
      // No token, redirect to login with return URL
      const loginUrl = new URL("/login", request.url);
      loginUrl.searchParams.set("next", pathname);
      return NextResponse.redirect(loginUrl);
    }

    try {
      // Verify token
      const supabaseAdmin = getSupabaseAdmin();
      const { data: { user }, error } = await supabaseAdmin.auth.getUser(
        accessToken
      );

      if (error || !user) {
        // Invalid token, redirect to login
        const loginUrl = new URL("/login", request.url);
        loginUrl.searchParams.set("next", pathname);
        loginUrl.searchParams.set("error", "session_expired");
        return NextResponse.redirect(loginUrl);
      }

      // Get user role for role-based access control
      const { data: userData } = await supabaseAdmin
        .from("users")
        .select("role")
        .eq("id", user.id)
        .single();

      const userRole = userData?.role;

      // Role-based route protection
      if (pathname.startsWith("/admin")) {
        if (userRole !== "admin") {
          const loginUrl = new URL("/login", request.url);
          loginUrl.searchParams.set("next", pathname);
          loginUrl.searchParams.set("unauthorized", "true");
          return NextResponse.redirect(loginUrl);
        }
      }

      if (pathname.startsWith("/vendor-portal")) {
        if (userRole !== "vendor" && userRole !== "admin") {
          const loginUrl = new URL("/login", request.url);
          loginUrl.searchParams.set("next", pathname);
          loginUrl.searchParams.set("unauthorized", "true");
          return NextResponse.redirect(loginUrl);
        }
      }

      // Allow access
      return NextResponse.next();
    } catch (error) {
      console.error("Middleware auth error:", error);
      // On error, redirect to login
      const loginUrl = new URL("/login", request.url);
      loginUrl.searchParams.set("next", pathname);
      return NextResponse.redirect(loginUrl);
    }
  }

  // Default: allow access
  return NextResponse.next();
}

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - public folder
     */
    "/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp|ico|css|js|woff|woff2|ttf|eot)$).*)",
  ],
};
