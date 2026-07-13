import { useQuery } from '@tanstack/react-query';
import { useAuthenticatedSupabase } from '@/lib/supabase';
import { getVendorConversations } from '@/lib/api/vendorMessages';

export function useVendorConversations(vendorId: string | undefined) {
  const client = useAuthenticatedSupabase();
  return useQuery({
    queryKey: ['vendor-conversations', vendorId],
    queryFn: () => getVendorConversations(client, vendorId!),
    enabled: !!vendorId,
  });
}
