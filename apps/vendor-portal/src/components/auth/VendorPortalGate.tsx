'use client';

import type { ReactNode } from 'react';
import { useEffect, useMemo, useState } from 'react';
import { usePathname, useRouter } from 'next/navigation';
import { Loader2 } from 'lucide-react';
import { useVendorPortalAccess } from '@/hooks/useVendorPortalAccess';

const ONBOARDING_ALLOWED_PREFIXES = ['/onboarding', '/storefront'];

function isOnboardingAllowedRoute(pathname: string): boolean {
  return ONBOARDING_ALLOWED_PREFIXES.some(
    (route) => pathname === route || pathname.startsWith(`${route}/`)
  );
}

function LoadingScreen({ label }: { label: string }) {
  return (
    <div className="flex min-h-screen items-center justify-center">
      <div className="text-center">
        <Loader2 className="mx-auto mb-2 h-8 w-8 animate-spin text-primary" />
        <p className="text-sm text-muted-foreground">{label}</p>
      </div>
    </div>
  );
}

export function VendorPortalGate({ children }: { children: ReactNode }) {
  const router = useRouter();
  const pathname = usePathname();
  const [isRouting, setIsRouting] = useState(true);
  const {
    isAuthLoaded,
    isSignedIn,
    isAccessLoading,
    role,
    canAccessPortal,
    needsOnboarding,
    isSuspended,
    isActiveVendor,
  } = useVendorPortalAccess();

  const onboardingRoute = useMemo(
    () => isOnboardingAllowedRoute(pathname),
    [pathname]
  );

  useEffect(() => {
    if (!isAuthLoaded) {
      return;
    }

    if (!isSignedIn) {
      const redirectUrl = new URL('/login', window.location.origin);
      redirectUrl.searchParams.set('next', pathname);
      router.replace(`${redirectUrl.pathname}${redirectUrl.search}`);
      return;
    }

    if (isAccessLoading) {
      return;
    }

    // role is null = user not in DB yet (webhook hasn't synced after signup).
    // Keep showing loading spinner while useVendorPortalAccess polls for the row.
    if (role === null) {
      return;
    }

    if (!canAccessPortal) {
      const redirectUrl = new URL('/login', window.location.origin);
      redirectUrl.searchParams.set('next', pathname);
      redirectUrl.searchParams.set('error', 'unauthorized_role');
      router.replace(`${redirectUrl.pathname}${redirectUrl.search}`);
      return;
    }

    if (isSuspended && !onboardingRoute) {
      router.replace('/onboarding?state=suspended');
      return;
    }

    if (needsOnboarding && !onboardingRoute) {
      router.replace('/onboarding');
      return;
    }

    if (isActiveVendor && pathname === '/onboarding') {
      router.replace('/');
      return;
    }

    setIsRouting(false);
  }, [
    canAccessPortal,
    isAccessLoading,
    isActiveVendor,
    isAuthLoaded,
    isSignedIn,
    isSuspended,
    needsOnboarding,
    onboardingRoute,
    pathname,
    role,
    router,
  ]);

  if (!isAuthLoaded || isAccessLoading || (isSignedIn && role === null)) {
    return <LoadingScreen label="Loading your vendor workspace..." />;
  }

  if (isRouting) {
    return <LoadingScreen label="Redirecting..." />;
  }

  return <>{children}</>;
}
