import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { useAuthenticatedSupabase } from '@/lib/supabase';
import { getVendorLeads, getVendorLead, respondToLead, updateLeadStatus } from '@/lib/api/vendorLeads';
import type { InquiryStatus } from '@/types/vendor';

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

export function useRespondToLead() {
  const client = useAuthenticatedSupabase();
  const invalidate = useInvalidateLeads();

  return useMutation({
    mutationFn: ({ id, response }: { id: string; response: string }) => respondToLead(client, id, response),
    onSuccess: (data) => invalidate(data.id),
  });
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
