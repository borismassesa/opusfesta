import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/lib/supabase';
import { getProductAddonsFaqContent } from '@/lib/api/product-addons-faq';

export function useProductAddonsFaqContent() {
  return useQuery({
    queryKey: ['product-detail', 'addons-faq'],
    queryFn: () => {
      if (!supabase) throw new Error('Supabase is not configured');
      return getProductAddonsFaqContent(supabase);
    },
  });
}
