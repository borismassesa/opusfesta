import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { useAuthenticatedSupabase } from '@/lib/supabase';
import { getVendorBookings, getVendorBooking, updateVendorBookingStage } from '@/lib/api/vendorBookings';
import type { BookingStage, VendorBookingTimelineEntry } from '@/types/vendor';

export function useVendorBookings(vendorId: string | undefined, stage?: BookingStage | 'all') {
  const client = useAuthenticatedSupabase();
  return useQuery({
    queryKey: ['vendor-bookings', vendorId, stage ?? 'all'],
    queryFn: () => getVendorBookings(client, vendorId!, stage),
    enabled: !!vendorId,
  });
}

export function useVendorBooking(id: string | undefined) {
  const client = useAuthenticatedSupabase();
  return useQuery({
    queryKey: ['vendor-booking', id],
    queryFn: () => getVendorBooking(client, id!),
    enabled: !!id,
  });
}

export function useAdvanceBookingStage() {
  const client = useAuthenticatedSupabase();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      id,
      stage,
      label,
      currentTimeline,
    }: {
      id: string;
      stage: BookingStage;
      label: string;
      currentTimeline: VendorBookingTimelineEntry[];
    }) => {
      const entry: VendorBookingTimelineEntry = { at: new Date().toISOString(), kind: stage, label };
      return updateVendorBookingStage(client, id, stage, entry, currentTimeline);
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['vendor-bookings'] });
      queryClient.invalidateQueries({ queryKey: ['vendor-booking', data.id] });
      queryClient.invalidateQueries({ queryKey: ['vendor-dashboard'] });
    },
  });
}
