import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { useAuthenticatedSupabase } from '@/lib/supabase';
import { useOpusFestaAuth } from '@/lib/auth';
import { getSavedVendors, getSavedVendorIds, saveVendor, unsaveVendor, markVendorBooked } from '@/lib/api/saved-vendors';

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

export function useToggleSavedVendor() {
  const client = useAuthenticatedSupabase();
  const queryClient = useQueryClient();
  const { user } = useOpusFestaAuth();

  return useMutation({
    mutationFn: ({ vendorId, isSaved }: { vendorId: string; isSaved: boolean }) =>
      isSaved ? unsaveVendor(client, vendorId) : saveVendor(client, vendorId, user!.id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['saved-vendors'] });
      queryClient.invalidateQueries({ queryKey: ['saved-vendor-ids'] });
      queryClient.invalidateQueries({ queryKey: ['dashboard'] });
    },
  });
}

export function useMarkVendorBooked() {
  const client = useAuthenticatedSupabase();
  const queryClient = useQueryClient();
  const { user } = useOpusFestaAuth();

  return useMutation({
    mutationFn: (vendorId: string) => markVendorBooked(client, vendorId, user!.id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['saved-vendors'] });
      queryClient.invalidateQueries({ queryKey: ['saved-vendor-ids'] });
      queryClient.invalidateQueries({ queryKey: ['dashboard'] });
    },
  });
}

export function useSavedVendorStatus(vendorId: string | undefined) {
  const { data: savedVendors = [] } = useSavedVendors();
  const row = savedVendors.find((r) => r.vendor_id === vendorId);
  return row?.status as 'saved' | 'contacted' | 'booked' | 'archived' | undefined;
}
