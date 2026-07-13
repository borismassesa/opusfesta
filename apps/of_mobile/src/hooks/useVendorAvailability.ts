import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { useAuthenticatedSupabase } from '@/lib/supabase';
import { getVendorAvailabilityRange, setVendorAvailability } from '@/lib/api/vendorAvailability';

export function useVendorAvailability(vendorId: string | undefined, start: string, end: string) {
  const client = useAuthenticatedSupabase();
  return useQuery({
    queryKey: ['vendor-availability', vendorId, start, end],
    queryFn: () => getVendorAvailabilityRange(client, vendorId!, start, end),
    enabled: !!vendorId,
  });
}

export function useSetVendorAvailability(vendorId: string | undefined) {
  const client = useAuthenticatedSupabase();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ date, isAvailable, reason }: { date: string; isAvailable: boolean; reason?: string }) =>
      setVendorAvailability(client, vendorId!, date, isAvailable, reason),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['vendor-availability', vendorId] });
    },
  });
}
