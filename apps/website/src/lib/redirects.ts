import type { UserRole, UserType } from "./auth";
import { getRedirectPath, mapRoleToUserType } from "./auth";

/**
 * Redirect to login page with return URL
 * @param returnUrl - URL to return to after login (optional)
 */
export function redirectToLogin(returnUrl?: string): void {
  if (typeof window === "undefined") {
    return;
  }

  const loginUrl = new URL("/login", window.location.origin);
  
  if (returnUrl) {
    loginUrl.searchParams.set("next", returnUrl);
  } else {
    // Use current path as return URL
    const currentPath = window.location.pathname + window.location.search;
    if (currentPath !== "/login" && currentPath !== "/signup") {
      loginUrl.searchParams.set("next", currentPath);
    }
  }

  window.location.href = loginUrl.toString();
}

/**
 * Redirect after successful login based on user role
 * @param userRole - User's role
 * @param userType - User's type (optional, will be derived from role if not provided)
 * @param next - Intended destination URL (optional)
 */
export function redirectAfterLogin(
  userRole: UserRole,
  userType?: UserType,
  next?: string | null
): void {
  if (typeof window === "undefined") {
    return;
  }

  const effectiveUserType = userType || mapRoleToUserType(userRole);
  const redirectPath = getRedirectPath(effectiveUserType, userRole, next);

  // Clear any auth-related sessionStorage items
  sessionStorage.removeItem("auth_redirect");
  sessionStorage.removeItem("auth_login_pending");
  sessionStorage.removeItem("auth_redirect_guard");

  window.location.href = redirectPath;
}

/**
 * Redirect unauthorized users
 * @param requiredRole - Required role that user doesn't have
 * @param currentPath - Current path (optional, will use window.location if not provided)
 */
export function redirectUnauthorized(
  requiredRole: UserRole,
  currentPath?: string
): void {
  if (typeof window === "undefined") {
    return;
  }

  const path = currentPath || window.location.pathname;
  
  // Store the intended destination
  sessionStorage.setItem("auth_redirect", path);
  
  // Redirect to login with error message
  const loginUrl = new URL("/login", window.location.origin);
  loginUrl.searchParams.set("next", path);
  loginUrl.searchParams.set("unauthorized", "true");
  loginUrl.searchParams.set("required_role", requiredRole);

  window.location.href = loginUrl.toString();
}

/**
 * Get redirect URL for login with return path
 * @param returnPath - Path to return to after login
 * @returns URL string
 */
export function getLoginRedirectUrl(returnPath: string): string {
  if (typeof window === "undefined") {
    return "/login";
  }

  const loginUrl = new URL("/login", window.location.origin);
  loginUrl.searchParams.set("next", returnPath);
  return loginUrl.toString();
}

/**
 * Store intended destination in sessionStorage
 * @param path - Path to store
 */
export function storeRedirectPath(path: string): void {
  if (typeof window === "undefined") {
    return;
  }

  sessionStorage.setItem("auth_redirect", path);
}

/**
 * Get stored redirect path from sessionStorage
 * @returns Stored path or null
 */
export function getStoredRedirectPath(): string | null {
  if (typeof window === "undefined") {
    return null;
  }

  return sessionStorage.getItem("auth_redirect");
}

/**
 * Clear stored redirect path
 */
export function clearStoredRedirectPath(): void {
  if (typeof window === "undefined") {
    return;
  }

  sessionStorage.removeItem("auth_redirect");
}

/**
 * Check if current path requires authentication
 * @param path - Path to check (optional, uses current path if not provided)
 * @returns boolean - true if path requires auth
 */
export function requiresAuth(path?: string): boolean {
  if (typeof window === "undefined") {
    return false;
  }

  const currentPath = path || window.location.pathname;
  
  // Protected paths
  const protectedPaths = [
    "/vendors/saved",
    "/my-inquiries",
    "/careers/my-applications",
    "/vendor-portal",
    "/admin",
  ];

  // Check exact match
  if (protectedPaths.includes(currentPath)) {
    return true;
  }

  // Check dynamic routes
  if (currentPath.startsWith("/careers/") && currentPath.includes("/apply")) {
    return true;
  }

  if (currentPath.startsWith("/inquiries/")) {
    return true;
  }

  return false;
}
