'use client';

import { useMemo } from 'react';
import { useQuery } from '@tanstack/react-query';
import { useUser } from '@clerk/nextjs';
import type {
  VendorMemberRole,
  VendorOnboardingStatus,
} from '@/lib/supabase/vendor';

type PortalRole = 'user' | 'vendor' | 'admin' | null;

interface VendorPortalAccessState {
  isAuthLoaded: boolean;
  isSignedIn: boolean;
  isAccessLoading: boolean;
  dbUserId: string | null;
  role: PortalRole;
  membershipRole: VendorMemberRole | null;
  vendorId: string | null;
  vendorSlug: string | null;
  vendorName: string | null;
  onboardingStatus: VendorOnboardingStatus | null;
  suspensionReason: string | null;
  canAccessPortal: boolean;
  needsOnboarding: boolean;
  isSuspended: boolean;
  isActiveVendor: boolean;
}

export function useVendorPortalAccess(): VendorPortalAccessState {
  const { user, isLoaded: isAuthLoaded, isSignedIn } = useUser();

  const { data, isLoading: isAccessLoading } = useQuery({
    queryKey: ['vendor-portal-access', user?.id],
    queryFn: async () => {
      if (!user?.id) {
        return null;
      }

      // Use the server API endpoint which has service role access
      // This bypasses the need for a working Clerk JWT template
      const res = await fetch('/api/auth/ensure-user', { method: 'POST' });
      if (!res.ok) {
        console.error('ensure-user failed:', res.status);
        return null;
      }

      const json = await res.json();
      return json.access ?? null;
    },
    enabled: isAuthLoaded && !!isSignedIn && !!user?.id,
    staleTime: 30_000,
    // Retry with short interval when user is signed in but not found in DB yet
    refetchInterval: (query) => {
      const result = query.state.data;
      if (result && result.role === null) {
        return 2000;
      }
      return false;
    },
  });

  return useMemo(() => {
    const role = (data?.role ?? null) as PortalRole;
    const onboardingStatus = data?.onboardingStatus ?? null;
    const hasVendor = !!data?.vendor?.id;
    const canAccessPortal = role === 'vendor' || role === 'admin';
    const needsOnboarding =
      role === 'vendor' &&
      (!hasVendor ||
        onboardingStatus === 'invited' ||
        onboardingStatus === 'in_progress');
    const isSuspended = role === 'vendor' && onboardingStatus === 'suspended';
    const isActiveVendor = role === 'vendor' && hasVendor && onboardingStatus === 'active';

    return {
      isAuthLoaded,
      isSignedIn: !!isSignedIn,
      isAccessLoading,
      dbUserId: data?.dbUserId ?? null,
      role,
      membershipRole: data?.membershipRole ?? null,
      vendorId: data?.vendor?.id ?? null,
      vendorSlug: data?.vendor?.slug ?? null,
      vendorName: data?.vendor?.business_name ?? null,
      onboardingStatus,
      suspensionReason: data?.suspensionReason ?? null,
      canAccessPortal,
      needsOnboarding,
      isSuspended,
      isActiveVendor,
    };
  }, [data, isAccessLoading, isAuthLoaded, isSignedIn]);
}
