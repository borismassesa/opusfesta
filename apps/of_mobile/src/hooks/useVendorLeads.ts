import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { useAuthenticatedSupabase } from '@/lib/supabase';
import { getVendorLeads, getVendorLead, updateLeadStatus } from '@/lib/api/vendorLeads';
import { sendProposal, acceptCounter, type ProposalDraft } from '@/lib/api/vendorProposal';
import type { InquiryRow, InquiryStatus } from '@/types/vendor';

export function useVendorLeads(vendorId: string | undefined, status?: InquiryStatus | 'all') {
  const client = useAuthenticatedSupabase();
  return useQuery({
    queryKey: ['vendor-leads', vendorId, status ?? 'all'],
    queryFn: () => getVendorLeads(client, vendorId!, status),
    enabled: !!vendorId,
  });
}

export function useVendorLead(id: string | undefined) {
  const client = useAuthenticatedSupabase();
  return useQuery({
    queryKey: ['vendor-lead', id],
    queryFn: () => getVendorLead(client, id!),
    enabled: !!id,
  });
}

function useInvalidateLeads() {
  const queryClient = useQueryClient();
  return (id: string) => {
    queryClient.invalidateQueries({ queryKey: ['vendor-leads'] });
    queryClient.invalidateQueries({ queryKey: ['vendor-lead', id] });
    queryClient.invalidateQueries({ queryKey: ['vendor-dashboard'] });
  };
}

export function useUpdateLeadStatus() {
  const client = useAuthenticatedSupabase();
  const queryClient = useQueryClient();
  const invalidate = useInvalidateLeads();

  return useMutation({
    mutationFn: ({ id, status }: { id: string; status: 'accepted' | 'declined' | 'closed' }) =>
      updateLeadStatus(client, id, status),
    onSuccess: (data) => {
      invalidate(data.id);
      // Accept/decline blocks or frees a date via a DB trigger on
      // vendor_availability - refetch the calendar so it reflects it.
      queryClient.invalidateQueries({ queryKey: ['vendor-availability'] });
    },
  });
}

export function useSendProposal() {
  const client = useAuthenticatedSupabase();
  const invalidate = useInvalidateLeads();

  return useMutation({
    mutationFn: ({ inquiry, draft }: { inquiry: Pick<InquiryRow, 'id' | 'status'>; draft: ProposalDraft }) =>
      sendProposal(client, inquiry, draft),
    onSuccess: (data) => invalidate(data.id),
  });
}

export function useAcceptCounter() {
  const client = useAuthenticatedSupabase();
  const queryClient = useQueryClient();
  const invalidate = useInvalidateLeads();

  return useMutation({
    mutationFn: ({ inquiry }: { inquiry: InquiryRow }) => acceptCounter(client, inquiry),
    onSuccess: (data) => {
      invalidate(data.id);
      // Accepting sets inquiries.status = 'accepted' (availability trigger)
      // and creates the vendor_bookings row - refresh both surfaces.
      queryClient.invalidateQueries({ queryKey: ['vendor-availability'] });
      queryClient.invalidateQueries({ queryKey: ['vendor-bookings'] });
    },
  });
}
