"use client";

import { ReactNode } from "react";
import { AuthGuard } from "./AuthGuard";
import type { UserRole } from "@/lib/auth";

interface ProtectedRouteProps {
  children: ReactNode;
  /**
   * Require specific role to access
   */
  role?: UserRole;
  /**
   * Require any of these roles to access
   */
  anyRole?: UserRole[];
  /**
   * Redirect to this path if not authenticated (default: /login)
   */
  redirectTo?: string;
  /**
   * Show loading state while checking auth
   */
  showLoading?: boolean;
  /**
   * Custom loading component
   */
  loadingComponent?: ReactNode;
  /**
   * Custom unauthorized component
   */
  unauthorizedComponent?: ReactNode;
}

/**
 * ProtectedRoute component - Higher-level wrapper for protecting routes
 * Uses AuthGuard internally but provides a simpler API
 */
export function ProtectedRoute({
  children,
  role,
  anyRole,
  redirectTo,
  showLoading,
  loadingComponent,
  unauthorizedComponent,
}: ProtectedRouteProps) {
  return (
    <AuthGuard
      requireRole={role}
      requireAnyRole={anyRole}
      redirectTo={redirectTo}
      showLoading={showLoading}
      loadingComponent={loadingComponent}
      unauthorizedComponent={unauthorizedComponent}
    >
      {children}
    </AuthGuard>
  );
}
