'use client';

import { useEffect, useState, type ReactNode } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import { supabase } from '@/lib/supabase/client';
import { ensureUserRecord } from '@/lib/auth';
import { Loader2 } from 'lucide-react';

interface AuthGuardProps {
  children: ReactNode;
  redirectTo?: string;
}

export function AuthGuard({ children, redirectTo = '/login' }: AuthGuardProps) {
  const router = useRouter();
  const pathname = usePathname();
  const [isAuthenticated, setIsAuthenticated] = useState<boolean | null>(null);
  const [isChecking, setIsChecking] = useState(true);

  useEffect(() => {
    let mounted = true;
    let subscription: { unsubscribe: () => void } | null = null;
    let timeoutId: NodeJS.Timeout | null = null;

    const checkAuth = async (retryCount = 0) => {
      try {
        // Add increasing delay for retries to allow session to propagate
        const delay = 200 + (retryCount * 100);
        await new Promise(resolve => setTimeout(resolve, delay));
        
        const { data: { session }, error } = await supabase.auth.getSession();

        if (!mounted) return;

        if (error) {
          console.error('[AuthGuard] Auth check error:', error);
          setIsAuthenticated(false);
          setIsChecking(false);
          // Only redirect if we're not already on the login page
          if (pathname !== redirectTo && !pathname.startsWith('/login')) {
            const redirectUrl = new URL(redirectTo, window.location.origin);
            redirectUrl.searchParams.set('next', pathname);
            // Use window.location to break potential loops
            window.location.href = redirectUrl.toString();
          }
          return;
        }

        if (!session) {
          // Retry up to 5 times if coming from login (session might not be ready yet)
          const isFromLogin = document.referrer.includes('/login') || 
                             sessionStorage.getItem('justLoggedIn') === 'true';
          
          if (retryCount < 5 && isFromLogin) {
            checkAuth(retryCount + 1);
            return;
          }
          
          // Clear the flag if we've exhausted retries
          sessionStorage.removeItem('justLoggedIn');
          
          setIsAuthenticated(false);
          setIsChecking(false);
          // Only redirect if we're not already on the login page
          if (pathname !== redirectTo && !pathname.startsWith('/login')) {
            const redirectUrl = new URL(redirectTo, window.location.origin);
            redirectUrl.searchParams.set('next', pathname);
            // Use window.location to break potential loops
            window.location.href = redirectUrl.toString();
          }
          return;
        }

        // CRITICAL: Verify user exists in database and create if needed
        const ensureResult = await ensureUserRecord(session);
        
        if (!ensureResult.success) {
          console.error('[AuthGuard] Failed to ensure user record:', ensureResult.error);
          setIsAuthenticated(false);
          setIsChecking(false);
          // Redirect to login with error message
          if (pathname !== redirectTo && !pathname.startsWith('/login')) {
            const redirectUrl = new URL(redirectTo, window.location.origin);
            redirectUrl.searchParams.set('next', pathname);
            redirectUrl.searchParams.set('error', 'account_setup_failed');
            window.location.href = redirectUrl.toString();
          }
          return;
        }

        // Clear the flag on successful auth
        sessionStorage.removeItem('justLoggedIn');
        setIsAuthenticated(true);
        setIsChecking(false);
      } catch (error) {
        console.error('[AuthGuard] Auth check exception:', error);
        if (mounted) {
          setIsAuthenticated(false);
          setIsChecking(false);
          // Only redirect if we're not already on the login page
          if (pathname !== redirectTo && !pathname.startsWith('/login')) {
            const redirectUrl = new URL(redirectTo, window.location.origin);
            redirectUrl.searchParams.set('next', pathname);
            // Use window.location to break potential loops
            window.location.href = redirectUrl.toString();
          }
        }
      }
    };

    // Set a timeout to prevent infinite loading (10 seconds max)
    timeoutId = setTimeout(() => {
      if (mounted && isChecking) {
        console.warn('[AuthGuard] Authentication check timed out after 10 seconds');
        setIsAuthenticated(false);
        setIsChecking(false);
        if (pathname !== redirectTo && !pathname.startsWith('/login')) {
          const redirectUrl = new URL(redirectTo, window.location.origin);
          redirectUrl.searchParams.set('next', pathname);
          redirectUrl.searchParams.set('error', 'auth_timeout');
          window.location.href = redirectUrl.toString();
        }
      }
    }, 10000);

    // Initial check
    checkAuth();

    // Listen to auth state changes
    const { data: { subscription: authSubscription } } = supabase.auth.onAuthStateChange(async (event, session) => {
      if (!mounted) return;

      if (event === 'SIGNED_OUT' || !session) {
        setIsAuthenticated(false);
        setIsChecking(false);
        // Only redirect if we're not already on the login page
        if (pathname !== redirectTo && !pathname.startsWith('/login')) {
          const redirectUrl = new URL(redirectTo, window.location.origin);
          redirectUrl.searchParams.set('next', pathname);
          // Use window.location to break potential loops
          window.location.href = redirectUrl.toString();
        }
      } else if (session) {
        // Verify user record exists when session is available
        const ensureResult = await ensureUserRecord(session);
        if (ensureResult.success) {
          setIsAuthenticated(true);
          setIsChecking(false);
        } else {
          console.error('[AuthGuard] Failed to ensure user record on auth state change:', ensureResult.error);
          setIsAuthenticated(false);
          setIsChecking(false);
        }
      }
    });

    subscription = authSubscription;

    return () => {
      mounted = false;
      if (timeoutId) {
        clearTimeout(timeoutId);
      }
      if (subscription) {
        subscription.unsubscribe();
      }
    };
  }, [router, pathname, redirectTo]);

  if (isChecking) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <Loader2 className="h-8 w-8 animate-spin text-primary mx-auto mb-2" />
          <p className="text-sm text-muted-foreground">Verifying authentication...</p>
        </div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <Loader2 className="h-8 w-8 animate-spin text-primary mx-auto mb-2" />
          <p className="text-sm text-muted-foreground">Redirecting to login...</p>
        </div>
      </div>
    );
  }

  return <>{children}</>;
}
