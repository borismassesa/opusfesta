'use client';

import { usePathname } from 'next/navigation';
import { VendorLayout } from './vendor-layout';
import type { ReactNode } from 'react';

// Routes that should NOT have the vendor layout (sidebar, etc.)
const PUBLIC_ROUTES = ['/login', '/signup'];

export function ConditionalVendorLayout({ children }: { children: ReactNode }) {
  const pathname = usePathname();

  // Don't wrap login/signup pages with VendorLayout
  if (PUBLIC_ROUTES.includes(pathname)) {
    return <>{children}</>;
  }

  // All other routes get the VendorLayout (no authentication required)
  return <VendorLayout>{children}</VendorLayout>;
}
