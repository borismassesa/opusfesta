"use client";

import { ReactNode } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { requireRole, requireAnyRole } from "@/lib/access-control";
import type { UserRole } from "@/lib/auth";
import { useEffect, useState } from "react";

interface RequireAuthProps {
  children: ReactNode;
  /**
   * Component to render if not authenticated
   */
  fallback?: ReactNode;
}

/**
 * Render children only if user is authenticated
 */
export function RequireAuth({ children, fallback = null }: RequireAuthProps) {
  const { isAuthenticated } = useAuth();

  if (!isAuthenticated) {
    return <>{fallback}</>;
  }

  return <>{children}</>;
}

interface RequireRoleProps {
  children: ReactNode;
  /**
   * Required role
   */
  role: UserRole;
  /**
   * Component to render if user doesn't have the role
   */
  fallback?: ReactNode;
}

/**
 * Render children only if user has the specified role
 */
export function RequireRole({ children, role, fallback = null }: RequireRoleProps) {
  const { user, session, isAuthenticated } = useAuth();
  const [hasRole, setHasRole] = useState<boolean | null>(null);

  useEffect(() => {
    async function checkRole() {
      if (!isAuthenticated || !user || !session) {
        setHasRole(false);
        return;
      }

      const userHasRole = await requireRole(role, session);
      setHasRole(userHasRole);
    }

    checkRole();
  }, [isAuthenticated, user, session, role]);

  if (hasRole === null || !hasRole) {
    return <>{fallback}</>;
  }

  return <>{children}</>;
}

interface RequireAnyRoleProps {
  children: ReactNode;
  /**
   * Array of allowed roles
   */
  roles: UserRole[];
  /**
   * Component to render if user doesn't have any of the roles
   */
  fallback?: ReactNode;
}

/**
 * Render children only if user has any of the specified roles
 */
export function RequireAnyRole({
  children,
  roles,
  fallback = null,
}: RequireAnyRoleProps) {
  const { user, session, isAuthenticated } = useAuth();
  const [hasAnyRole, setHasAnyRole] = useState<boolean | null>(null);

  useEffect(() => {
    async function checkRoles() {
      if (!isAuthenticated || !user || !session) {
        setHasAnyRole(false);
        return;
      }

      const userHasAnyRole = await requireAnyRole(roles, session);
      setHasAnyRole(userHasAnyRole);
    }

    checkRoles();
  }, [isAuthenticated, user, session, roles]);

  if (hasAnyRole === null || !hasAnyRole) {
    return <>{fallback}</>;
  }

  return <>{children}</>;
}

interface IfAuthenticatedProps {
  children: ReactNode;
  /**
   * Component to render if not authenticated
   */
  fallback?: ReactNode;
}

/**
 * Render children if authenticated, fallback if not
 */
export function IfAuthenticated({
  children,
  fallback = null,
}: IfAuthenticatedProps) {
  const { isAuthenticated } = useAuth();

  return <>{isAuthenticated ? children : fallback}</>;
}

interface IfNotAuthenticatedProps {
  children: ReactNode;
  /**
   * Component to render if authenticated
   */
  fallback?: ReactNode;
}

/**
 * Render children if not authenticated, fallback if authenticated
 */
export function IfNotAuthenticated({
  children,
  fallback = null,
}: IfNotAuthenticatedProps) {
  const { isAuthenticated } = useAuth();

  return <>{!isAuthenticated ? children : fallback}</>;
}
