import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { useAuthenticatedSupabase } from '@/lib/supabase';

export function useCoupleProfile() {
  const client = useAuthenticatedSupabase();
  return useQuery({
    queryKey: ['couple-profile'],
    queryFn: async () => {
      const { data, error } = await client.from('couple_profiles').select('*').maybeSingle();
      if (error) throw error;
      return data;
    },
  });
}

export function useUpdateCoupleProfile() {
  const client = useAuthenticatedSupabase();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (updates: Record<string, unknown>) => {
      const { data, error } = await client
        .from('couple_profiles')
        .update(updates)
        .select()
        .single();
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['couple-profile'] });
      queryClient.invalidateQueries({ queryKey: ['dashboard'] });
    },
  });
}
