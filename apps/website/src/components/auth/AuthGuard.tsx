"use client";

import { useEffect, useState, ReactNode } from "react";
import { useRouter, usePathname } from "next/navigation";
import { useAuth } from "@/contexts/AuthContext";
import { requireRole, requireAnyRole, canAccessRoute } from "@/lib/access-control";
import type { UserRole } from "@/lib/auth";
import { redirectToLogin } from "@/lib/redirects";
import { Loader2 } from "lucide-react";

interface AuthGuardProps {
  children: ReactNode;
  /**
   * Require specific role to access
   */
  requireRole?: UserRole;
  /**
   * Require any of these roles to access
   */
  requireAnyRole?: UserRole[];
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

export function AuthGuard({
  children,
  requireRole: requiredRole,
  requireAnyRole: requiredAnyRole,
  redirectTo = "/login",
  showLoading = true,
  loadingComponent,
  unauthorizedComponent,
}: AuthGuardProps) {
  const router = useRouter();
  const pathname = usePathname();
  const { user, isLoading, isAuthenticated, session } = useAuth();
  const [isChecking, setIsChecking] = useState(true);
  const [isAuthorized, setIsAuthorized] = useState(false);

  useEffect(() => {
    async function checkAuthorization() {
      if (isLoading) {
        return; // Wait for auth context to finish loading
      }

      setIsChecking(true);

      try {
        // Check authentication
        if (!isAuthenticated || !user || !session) {
          setIsAuthorized(false);
          setIsChecking(false);
          
          // Store current path for redirect after login
          if (typeof window !== "undefined") {
            sessionStorage.setItem("auth_redirect", pathname);
          }
          
          router.push(`${redirectTo}?next=${encodeURIComponent(pathname)}`);
          return;
        }

        // Check role requirements
        if (requiredRole) {
          const hasRole = await requireRole(requiredRole, session);
          if (!hasRole) {
            setIsAuthorized(false);
            setIsChecking(false);
            
            if (unauthorizedComponent) {
              return;
            }
            
            // Redirect to login with unauthorized message
            router.push(`${redirectTo}?next=${encodeURIComponent(pathname)}&unauthorized=true&required_role=${requiredRole}`);
            return;
          }
        }

        if (requiredAnyRole && requiredAnyRole.length > 0) {
          const hasAnyRole = await requireAnyRole(requiredAnyRole, session);
          if (!hasAnyRole) {
            setIsAuthorized(false);
            setIsChecking(false);
            
            if (unauthorizedComponent) {
              return;
            }
            
            // Redirect to login with unauthorized message
            router.push(`${redirectTo}?next=${encodeURIComponent(pathname)}&unauthorized=true`);
            return;
          }
        }

        // Check route access based on role
        if (user.role) {
          const canAccess = canAccessRoute(pathname, user.role);
          if (!canAccess) {
            setIsAuthorized(false);
            setIsChecking(false);
            
            if (unauthorizedComponent) {
              return;
            }
            
            // Redirect to login with unauthorized message
            router.push(`${redirectTo}?next=${encodeURIComponent(pathname)}&unauthorized=true`);
            return;
          }
        }

        setIsAuthorized(true);
      } catch (error) {
        console.error("Error checking authorization:", error);
        setIsAuthorized(false);
      } finally {
        setIsChecking(false);
      }
    }

    checkAuthorization();
  }, [
    isLoading,
    isAuthenticated,
    user,
    session,
    requiredRole,
    requiredAnyRole,
    pathname,
    router,
    redirectTo,
    unauthorizedComponent,
  ]);

  // Show loading state
  if (isLoading || isChecking) {
    if (loadingComponent) {
      return <>{loadingComponent}</>;
    }

    if (showLoading) {
      return (
        <div className="flex items-center justify-center min-h-screen">
          <div className="flex flex-col items-center gap-4">
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
            <p className="text-sm text-muted-foreground">Checking authentication...</p>
          </div>
        </div>
      );
    }

    return null;
  }

  // Show unauthorized component if provided
  if (!isAuthorized && unauthorizedComponent) {
    return <>{unauthorizedComponent}</>;
  }

  // Don't render children if not authorized (will redirect)
  if (!isAuthorized) {
    return null;
  }

  return <>{children}</>;
}
