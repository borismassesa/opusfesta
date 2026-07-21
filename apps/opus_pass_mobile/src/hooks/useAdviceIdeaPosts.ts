import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/lib/supabase';
import { getAdviceIdeaPosts } from '@/lib/api/advice-ideas';

export function useAdviceIdeaPosts() {
  return useQuery({
    queryKey: ['advice-ideas', 'posts'],
    queryFn: () => {
      if (!supabase) throw new Error('Supabase is not configured');
      return getAdviceIdeaPosts(supabase);
    },
  });
}
