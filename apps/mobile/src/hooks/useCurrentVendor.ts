import { useQuery } from '@tanstack/react-query';
import { useAuthenticatedSupabase } from '@/lib/supabase';
import { getMyVendor } from '@/lib/api/vendorProfile';
import type { VendorRow } from '@/types/vendor';

export type VendorApprovalState =
  | { kind: 'loading' }
  | { kind: 'active' }
  | { kind: 'pending'; status: string }
  | { kind: 'suspended' };

function toApprovalState(vendor: VendorRow | null | undefined, isLoading: boolean): VendorApprovalState {
  if (isLoading || !vendor) return { kind: 'loading' };
  if (vendor.onboarding_status === 'active') return { kind: 'active' };
  if (vendor.onboarding_status === 'suspended') return { kind: 'suspended' };
  return { kind: 'pending', status: vendor.onboarding_status };
}

/**
 * The signed-in vendor's own storefront row + their approval state. A vendor
 * row is created during vendor onboarding (one per user, unique on user_id),
 * so `vendor` should only stay null past initial load for an account that
 * completed onboarding as 'vendor' in Clerk but somehow has no row —
 * treated as still-loading rather than a hard error, since retrying the
 * query is more useful than showing a dead end.
 */
export function useCurrentVendor() {
  const client = useAuthenticatedSupabase();
  const query = useQuery({
    queryKey: ['vendor', 'me'],
    queryFn: () => getMyVendor(client),
  });

  return {
    vendor: query.data ?? null,
    approvalState: toApprovalState(query.data, query.isLoading),
    isLoading: query.isLoading,
    error: query.error,
    refetch: query.refetch,
  };
}
