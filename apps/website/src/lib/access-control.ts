import { supabase } from "./supabaseClient";
import type { UserRole, UserType } from "./auth";
import { getUserRole, getUserTypeFromSession, mapRoleToUserType } from "./auth";
import type { Session } from "@supabase/supabase-js";

/**
 * Route access configuration
 * Defines which routes are accessible by which roles
 */
export const ROUTE_ACCESS: Record<string, UserRole[]> = {
  // Public routes - accessible by all
  "/": ["user", "vendor", "admin"],
  "/vendors": ["user", "vendor", "admin"],
  "/vendors/[slug]": ["user", "vendor", "admin"],
  "/planning": ["user", "vendor", "admin"],
  "/advice-and-ideas": ["user", "vendor", "admin"],
  "/careers": ["user", "vendor", "admin"],
  
  // Couple/User routes
  "/vendors/saved": ["user", "admin"],
  "/my-inquiries": ["user", "admin"],
  "/careers/my-applications": ["user", "admin"],
  "/careers/[id]/apply": ["user", "admin"],
  
  // Vendor routes
  "/vendor-portal": ["vendor", "admin"],
  
  // Admin routes
  "/admin": ["admin"],
};

/**
 * Check if user is authenticated
 * @param session - Supabase session (optional, will fetch if not provided)
 * @returns Promise<boolean> - true if authenticated, false otherwise
 */
export async function requireAuth(session?: Session | null): Promise<boolean> {
  try {
    const currentSession = session || (await supabase.auth.getSession()).data.session;
    
    if (!currentSession?.user) {
      return false;
    }
    
    // Verify user still exists in Auth
    const { data: { user }, error } = await supabase.auth.getUser();
    
    if (error || !user || user.id !== currentSession.user.id) {
      return false;
    }
    
    return true;
  } catch (error) {
    console.error("Error checking authentication:", error);
    return false;
  }
}

/**
 * Check if user has a specific role
 * @param role - Required role
 * @param session - Supabase session (optional, will fetch if not provided)
 * @returns Promise<boolean> - true if user has the role, false otherwise
 */
export async function requireRole(
  role: UserRole,
  session?: Session | null
): Promise<boolean> {
  try {
    const isAuthenticated = await requireAuth(session);
    if (!isAuthenticated) {
      return false;
    }
    
    const currentSession = session || (await supabase.auth.getSession()).data.session;
    if (!currentSession?.user) {
      return false;
    }
    
    const userRole = await getUserRole(currentSession.user.id);
    return userRole === role;
  } catch (error) {
    console.error("Error checking role:", error);
    return false;
  }
}

/**
 * Check if user has any of the specified roles
 * @param roles - Array of allowed roles
 * @param session - Supabase session (optional, will fetch if not provided)
 * @returns Promise<boolean> - true if user has any of the roles, false otherwise
 */
export async function requireAnyRole(
  roles: UserRole[],
  session?: Session | null
): Promise<boolean> {
  try {
    const isAuthenticated = await requireAuth(session);
    if (!isAuthenticated) {
      return false;
    }
    
    const currentSession = session || (await supabase.auth.getSession()).data.session;
    if (!currentSession?.user) {
      return false;
    }
    
    const userRole = await getUserRole(currentSession.user.id);
    return userRole ? roles.includes(userRole) : false;
  } catch (error) {
    console.error("Error checking roles:", error);
    return false;
  }
}

/**
 * Check if a user can access a specific route based on their role
 * @param path - Route path to check
 * @param userRole - User's role
 * @returns boolean - true if user can access the route, false otherwise
 */
export function canAccessRoute(path: string, userRole: UserRole | null): boolean {
  if (!userRole) {
    return false;
  }
  
  // Normalize path (remove query params, hash, trailing slashes)
  const normalizedPath = path.split("?")[0].split("#")[0].replace(/\/$/, "") || "/";
  
  // Check exact match first
  if (ROUTE_ACCESS[normalizedPath]) {
    return ROUTE_ACCESS[normalizedPath].includes(userRole);
  }
  
  // Check dynamic routes (e.g., /vendors/[slug])
  for (const [routePattern, allowedRoles] of Object.entries(ROUTE_ACCESS)) {
    // Convert Next.js dynamic route pattern to regex
    const regexPattern = routePattern
      .replace(/\[([^\]]+)\]/g, "[^/]+") // Replace [slug] with [^/]+
      .replace(/\//g, "\\/"); // Escape slashes
    
    const regex = new RegExp(`^${regexPattern}$`);
    
    if (regex.test(normalizedPath)) {
      return allowedRoles.includes(userRole);
    }
  }
  
  // Default: allow access (public route)
  return true;
}

/**
 * Get list of allowed routes for a specific role
 * @param userRole - User's role
 * @returns string[] - Array of route patterns the user can access
 */
export function getAllowedRoutes(userRole: UserRole): string[] {
  const allowedRoutes: string[] = [];
  
  for (const [route, allowedRoles] of Object.entries(ROUTE_ACCESS)) {
    if (allowedRoles.includes(userRole)) {
      allowedRoutes.push(route);
    }
  }
  
  return allowedRoutes;
}

/**
 * Check if a route requires authentication
 * @param path - Route path to check
 * @returns boolean - true if route requires auth, false otherwise
 */
export function isProtectedRoute(path: string): boolean {
  const normalizedPath = path.split("?")[0].split("#")[0].replace(/\/$/, "") || "/";
  
  // Check if route is in ROUTE_ACCESS (not public)
  if (ROUTE_ACCESS[normalizedPath]) {
    return true;
  }
  
  // Check dynamic routes
  for (const routePattern of Object.keys(ROUTE_ACCESS)) {
    const regexPattern = routePattern
      .replace(/\[([^\]]+)\]/g, "[^/]+")
      .replace(/\//g, "\\/");
    
    const regex = new RegExp(`^${regexPattern}$`);
    
    if (regex.test(normalizedPath)) {
      return true;
    }
  }
  
  // Default: assume public route
  return false;
}

/**
 * Get user's role from session
 * @param session - Supabase session (optional, will fetch if not provided)
 * @returns Promise<UserRole | null> - User's role or null if not authenticated
 */
export async function getCurrentUserRole(
  session?: Session | null
): Promise<UserRole | null> {
  try {
    const isAuthenticated = await requireAuth(session);
    if (!isAuthenticated) {
      return null;
    }
    
    const currentSession = session || (await supabase.auth.getSession()).data.session;
    if (!currentSession?.user) {
      return null;
    }
    
    return await getUserRole(currentSession.user.id);
  } catch (error) {
    console.error("Error getting user role:", error);
    return null;
  }
}

/**
 * Get user's type from session
 * @param session - Supabase session (optional, will fetch if not provided)
 * @returns Promise<UserType | null> - User's type or null if not authenticated
 */
export async function getCurrentUserType(
  session?: Session | null
): Promise<UserType | null> {
  try {
    const currentSession = session || (await supabase.auth.getSession()).data.session;
    if (!currentSession) {
      return null;
    }
    
    return await getUserTypeFromSession(currentSession);
  } catch (error) {
    console.error("Error getting user type:", error);
    return null;
  }
}
