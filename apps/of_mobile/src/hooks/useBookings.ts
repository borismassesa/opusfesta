import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useAuthenticatedSupabase } from '@/lib/supabase';
import { getMyBookings, getBookingById, createBookingInquiry } from '@/lib/api/bookings';

export function useMyBookings() {
  const client = useAuthenticatedSupabase();
  return useQuery({
    queryKey: ['bookings'],
    queryFn: () => getMyBookings(client),
  });
}

export function useBooking(id: string | undefined) {
  const client = useAuthenticatedSupabase();
  return useQuery({
    queryKey: ['booking', id],
    queryFn: () => getBookingById(client, id!),
    enabled: !!id,
  });
}

export function useCreateBookingInquiry() {
  const client = useAuthenticatedSupabase();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (payload: Parameters<typeof createBookingInquiry>[1]) =>
      createBookingInquiry(client, payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['bookings'] });
    },
  });
}
