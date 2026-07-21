import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/lib/supabase';
import { getInvitationProducts } from '@/lib/api/invitations-products';

export function useInvitationProducts() {
  return useQuery({
    queryKey: ['invitations', 'products'],
    queryFn: () => {
      if (!supabase) throw new Error('Supabase is not configured');
      return getInvitationProducts(supabase);
    },
  });
}
