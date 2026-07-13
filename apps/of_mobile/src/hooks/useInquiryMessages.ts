import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { useAuthenticatedSupabase } from '@/lib/supabase';
import { getInquiryMessages, sendInquiryMessage } from '@/lib/api/inquiryMessages';

export function useInquiryMessages(inquiryId: string | undefined) {
  const client = useAuthenticatedSupabase();
  return useQuery({
    queryKey: ['inquiry-messages', inquiryId],
    queryFn: () => getInquiryMessages(client, inquiryId!),
    enabled: !!inquiryId,
  });
}

export function useSendInquiryMessage() {
  const client = useAuthenticatedSupabase();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ inquiryId, content }: { inquiryId: string; content: string }) =>
      sendInquiryMessage(client, inquiryId, content),
    onSuccess: (_data, { inquiryId }) => {
      queryClient.invalidateQueries({ queryKey: ['inquiry-messages', inquiryId] });
      // A vendor reply flips a pending lead to responded server-side.
      queryClient.invalidateQueries({ queryKey: ['vendor-leads'] });
      queryClient.invalidateQueries({ queryKey: ['vendor-lead', inquiryId] });
    },
  });
}
