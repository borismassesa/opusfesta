import type { UserType, UserRole } from "./types";

/**
 * Maps user_type from signup to database role
 */
export function mapUserTypeToRole(userType: UserType): UserRole {
  switch (userType) {
    case "couple":
      return "user";
    case "vendor":
      return "vendor";
    case "admin":
      return "admin";
    default:
      return "user";
  }
}

/**
 * Maps database role to user_type
 */
export function mapRoleToUserType(role: UserRole): UserType {
  switch (role) {
    case "user":
      return "couple";
    case "vendor":
      return "vendor";
    case "admin":
      return "admin";
    default:
      return "couple";
  }
}

/**
 * Get redirect path based on user type/role
 */
export function getRedirectPath(
  userType?: UserType,
  role?: UserRole,
  next?: string | null
): string {
  // If there's a next parameter and it's a valid path, use it
  if (
    next &&
    next.startsWith("/") &&
    !next.startsWith("/admin") &&
    !next.startsWith("/login") &&
    !next.startsWith("/signup") &&
    !next.startsWith("/verify-email")
  ) {
    return next;
  }

  const effectiveUserType =
    userType || (role ? mapRoleToUserType(role) : "couple");

  // Check if we're in a careers context
  const nextFromStorage =
    typeof window !== "undefined"
      ? sessionStorage.getItem("auth_redirect")
      : null;
  const effectiveNext = next || nextFromStorage;
  const isCareersContext =
    effectiveNext?.includes("/careers") ||
    (typeof window !== "undefined" &&
      window.location.pathname.includes("/careers"));

  switch (effectiveUserType) {
    case "couple":
      if (isCareersContext) {
        return effectiveNext?.startsWith("/careers")
          ? effectiveNext
          : "/careers";
      }
      return "/";
    case "vendor":
      return "/vendor-portal";
    case "admin":
      return "/admin";
    default:
      if (isCareersContext) {
        return effectiveNext?.startsWith("/careers")
          ? effectiveNext
          : "/careers";
      }
      return "/";
  }
}
