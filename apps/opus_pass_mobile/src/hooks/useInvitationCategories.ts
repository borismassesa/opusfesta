import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/lib/supabase';
import { getInvitationCategories } from '@/lib/api/invitation-categories';

export function useInvitationCategories() {
  return useQuery({
    queryKey: ['invitations', 'categories'],
    queryFn: () => {
      if (!supabase) throw new Error('Supabase is not configured');
      return getInvitationCategories(supabase);
    },
  });
}
