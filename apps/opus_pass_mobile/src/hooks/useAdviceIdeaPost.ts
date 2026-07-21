import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/lib/supabase';
import { getAdviceIdeaPostBySlug } from '@/lib/api/advice-ideas';

export function useAdviceIdeaPost(slug: string | undefined) {
  return useQuery({
    queryKey: ['advice-ideas', 'post', slug],
    queryFn: () => {
      if (!supabase) throw new Error('Supabase is not configured');
      if (!slug) throw new Error('Missing article slug');
      return getAdviceIdeaPostBySlug(supabase, slug);
    },
    enabled: Boolean(slug),
  });
}
