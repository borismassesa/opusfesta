import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/lib/supabase';
import { getPackagesContent } from '@/lib/api/packages';

export function usePackagesContent() {
  return useQuery({
    queryKey: ['packages', 'wedding-tiers'],
    queryFn: () => {
      if (!supabase) throw new Error('Supabase is not configured');
      return getPackagesContent(supabase);
    },
  });
}
