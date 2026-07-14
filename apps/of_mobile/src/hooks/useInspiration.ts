import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { useAuthenticatedSupabase } from '@/lib/supabase';
import { useOpusFestaAuth } from '@/lib/auth';
import { getInspirationItems, addInspirationItem, removeInspirationItem } from '@/lib/api/inspiration';

export function useInspirationItems() {
  const client = useAuthenticatedSupabase();
  return useQuery({
    queryKey: ['inspiration-items'],
    queryFn: () => getInspirationItems(client),
  });
}

export function useAddInspirationItem() {
  const client = useAuthenticatedSupabase();
  const queryClient = useQueryClient();
  const { user } = useOpusFestaAuth();

  return useMutation({
    mutationFn: (item: { imageUrl: string; vendorId?: string; category?: string; note?: string }) =>
      addInspirationItem(client, user!.id, item),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['inspiration-items'] });
    },
  });
}

export function useRemoveInspirationItem() {
  const client = useAuthenticatedSupabase();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => removeInspirationItem(client, id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['inspiration-items'] });
    },
  });
}
