import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { useAuthenticatedSupabase } from '@/lib/supabase';
import {
  getSavedVendorIds,
  getSavedVendors,
  markVendorBooked,
  saveVendor,
  unsaveVendor,
} from '@/lib/api/saved-vendors';
import { MissingInternalUserError, useInternalUserId } from './useInternalUserId';
import type { SavedVendorStatus } from '@/types/vendor';

export function useSavedVendors() {
  const client = useAuthenticatedSupabase();
  return useQuery({
    queryKey: ['saved-vendors'],
    queryFn: () => getSavedVendors(client),
  });
}

export function useSavedVendorIds() {
  const client = useAuthenticatedSupabase();
  return useQuery({
    queryKey: ['saved-vendor-ids'],
    queryFn: () => getSavedVendorIds(client),
  });
}

/** 'dashboard' is invalidated too — QuickStatsBand shows the saved-vendor count. */
function useSavedVendorInvalidation() {
  const queryClient = useQueryClient();
  return () => {
    queryClient.invalidateQueries({ queryKey: ['saved-vendors'] });
    queryClient.invalidateQueries({ queryKey: ['saved-vendor-ids'] });
    queryClient.invalidateQueries({ queryKey: ['dashboard'] });
  };
}

export function useToggleSavedVendor() {
  const client = useAuthenticatedSupabase();
  const { data: userId } = useInternalUserId();
  const invalidate = useSavedVendorInvalidation();

  return useMutation({
    mutationFn: async ({ vendorId, isSaved }: { vendorId: string; isSaved: boolean }) => {
      if (isSaved) return unsaveVendor(client, vendorId);
      if (!userId) throw new MissingInternalUserError();
      return saveVendor(client, vendorId, userId);
    },
    onSuccess: invalidate,
  });
}

export function useMarkVendorBooked() {
  const client = useAuthenticatedSupabase();
  const { data: userId } = useInternalUserId();
  const invalidate = useSavedVendorInvalidation();

  return useMutation({
    mutationFn: async (vendorId: string) => {
      if (!userId) throw new MissingInternalUserError();
      return markVendorBooked(client, vendorId, userId);
    },
    onSuccess: invalidate,
  });
}

/** Derives status from the already-fetched saved list rather than refetching. */
export function useSavedVendorStatus(vendorId: string | undefined): SavedVendorStatus | null {
  const { data } = useSavedVendors();
  if (!vendorId || !data) return null;
  return data.find((row) => row.vendor_id === vendorId)?.status ?? null;
}
