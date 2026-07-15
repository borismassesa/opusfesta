import { useQuery } from '@tanstack/react-query';
import { useAuthenticatedSupabase } from '@/lib/supabase';
import { getMyVendor } from '@/lib/api/vendorProfile';
import type { VendorMemberRole } from '@/lib/api/vendorProfile';
import type { VendorRow } from '@/types/vendor';

export type { VendorMemberRole };

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
 * The signed-in vendor's own storefront row + their approval state + their
 * role on the account. Owners resolve via vendors.user_id; staff/manager
 * accounts resolve via their active vendor_memberships row. `vendor` should
 * only stay null past initial load for an account that completed onboarding
 * as 'vendor' in Clerk but has neither a vendors row nor an active
 * membership — treated as still-loading rather than a hard error, since
 * retrying the query is more useful than showing a dead end.
 */
export function useCurrentVendor() {
  const client = useAuthenticatedSupabase();
  const query = useQuery({
    queryKey: ['vendor', 'me'],
    queryFn: () => getMyVendor(client),
  });

  return {
    vendor: query.data?.vendor ?? null,
    myRole: query.data?.myRole ?? null,
    approvalState: toApprovalState(query.data?.vendor, query.isLoading),
    isLoading: query.isLoading,
    error: query.error,
    refetch: query.refetch,
  };
}
