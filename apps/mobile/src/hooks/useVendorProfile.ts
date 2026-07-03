import { useMutation, useQueryClient } from '@tanstack/react-query';
import { useAuthenticatedSupabase } from '@/lib/supabase';
import { updateMyVendor, updateVendorPackages } from '@/lib/api/vendorProfile';
import type { VendorPackage, VendorRow } from '@/types/vendor';

function useInvalidateVendor() {
  const queryClient = useQueryClient();
  return () => {
    queryClient.invalidateQueries({ queryKey: ['vendor', 'me'] });
    queryClient.invalidateQueries({ queryKey: ['vendor-dashboard'] });
  };
}

export function useUpdateVendorProfile() {
  const client = useAuthenticatedSupabase();
  const invalidate = useInvalidateVendor();

  return useMutation({
    mutationFn: ({ vendorId, patch }: { vendorId: string; patch: Parameters<typeof updateMyVendor>[2] }) =>
      updateMyVendor(client, vendorId, patch),
    onSuccess: invalidate,
  });
}

export function useUpdateVendorPackages() {
  const client = useAuthenticatedSupabase();
  const invalidate = useInvalidateVendor();

  return useMutation({
    mutationFn: ({ vendorId, packages }: { vendorId: string; packages: VendorPackage[] }) =>
      updateVendorPackages(client, vendorId, packages),
    onSuccess: invalidate,
  });
}

export type { VendorRow, VendorPackage };
