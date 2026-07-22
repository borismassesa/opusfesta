import { useCallback } from 'react';
import { useAuth } from '@clerk/clerk-expo';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import {
  acceptProposal,
  counterProposal,
  getInquiry,
  getMyInquiries,
  sendInquiryMessage,
} from '@/lib/api/inquiries';

/** Default Clerk session token — opus_website's middleware expects this, not the `supabase` template. */
function useSessionToken() {
  const { getToken } = useAuth();
  return useCallback(async () => {
    const token = await getToken();
    if (!token) throw new Error('You need to be signed in to view your requests.');
    return token;
  }, [getToken]);
}

export function useMyInquiries() {
  const getSessionToken = useSessionToken();
  return useQuery({
    queryKey: ['my-inquiries'],
    queryFn: async () => getMyInquiries(await getSessionToken()),
  });
}

export function useInquiry(id: string | undefined) {
  const getSessionToken = useSessionToken();
  return useQuery({
    queryKey: ['inquiry', id],
    queryFn: async () => getInquiry(await getSessionToken(), id!),
    enabled: Boolean(id),
  });
}

function useInquiryInvalidation(id: string | undefined) {
  const queryClient = useQueryClient();
  return () => {
    queryClient.invalidateQueries({ queryKey: ['inquiry', id] });
    queryClient.invalidateQueries({ queryKey: ['my-inquiries'] });
  };
}

export function useSendInquiryMessage(id: string | undefined) {
  const getSessionToken = useSessionToken();
  const invalidate = useInquiryInvalidation(id);

  return useMutation({
    mutationFn: async (content: string) => sendInquiryMessage(await getSessionToken(), id!, content),
    onSuccess: invalidate,
  });
}

export function useAcceptProposal(id: string | undefined) {
  const getSessionToken = useSessionToken();
  const invalidate = useInquiryInvalidation(id);

  return useMutation({
    mutationFn: async () => acceptProposal(await getSessionToken(), id!),
    onSuccess: invalidate,
  });
}

export function useCounterProposal(id: string | undefined) {
  const getSessionToken = useSessionToken();
  const invalidate = useInquiryInvalidation(id);

  return useMutation({
    mutationFn: async (input: { counterAmount?: number; counterMessage?: string }) =>
      counterProposal(await getSessionToken(), id!, input),
    onSuccess: invalidate,
  });
}
