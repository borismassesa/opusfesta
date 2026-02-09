'use client';

import { usePathname } from 'next/navigation';
import { VendorLayout } from './vendor-layout';
import type { ReactNode } from 'react';
import { VendorPortalGate } from '@/components/auth/VendorPortalGate';

// Routes that should NOT have the vendor layout (sidebar, etc.)
const PUBLIC_ROUTE_PREFIXES = [
  '/login',
  '/signup',
  '/forgot-password',
  '/reset-password',
  '/sso-callback',
];

function isPublicRoute(pathname: string) {
  return PUBLIC_ROUTE_PREFIXES.some((route) => pathname === route || pathname.startsWith(`${route}/`));
}

export function ConditionalVendorLayout({ children }: { children: ReactNode }) {
  const pathname = usePathname();

  // Keep auth flows outside vendor shell
  if (isPublicRoute(pathname)) {
    return <>{children}</>;
  }

  // All portal routes use vendor shell (auth is handled by Clerk middleware)
  return (
    <VendorPortalGate>
      <VendorLayout>{children}</VendorLayout>
    </VendorPortalGate>
  );
}
