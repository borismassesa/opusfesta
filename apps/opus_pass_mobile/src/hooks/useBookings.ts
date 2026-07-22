import { useMutation, useQueryClient } from '@tanstack/react-query';
import { useAuthenticatedSupabase } from '@/lib/supabase';
import { createBookingInquiry, type BookingInquiryPayload } from '@/lib/api/bookings';
import { MissingInternalUserError, useInternalUserId } from './useInternalUserId';

export function useCreateBookingInquiry() {
  const client = useAuthenticatedSupabase();
  const { data: userId } = useInternalUserId();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (payload: Omit<BookingInquiryPayload, 'userId'>) => {
      if (!userId) throw new MissingInternalUserError();
      return createBookingInquiry(client, { ...payload, userId });
    },
    onSuccess: () => {
      // The inquiry insert seeds a message thread via DB trigger.
      queryClient.invalidateQueries({ queryKey: ['conversations'] });
      queryClient.invalidateQueries({ queryKey: ['my-inquiries'] });
    },
  });
}
