import { useQuery } from '@tanstack/react-query';
import { useAuthenticatedSupabase } from '@/lib/supabase';
import { getAdviceIdeas } from '@/lib/api/adviceIdeas';

export function useAdviceIdeas() {
  const client = useAuthenticatedSupabase();
  return useQuery({
    queryKey: ['advice-ideas'],
    queryFn: () => getAdviceIdeas(client),
  });
}
