import { useQuery } from '@tanstack/react-query';
import { useAuthenticatedSupabase } from '@/lib/supabase';
import { getMyEvents, getEventById, getDashboardData } from '@/lib/api/events';

export function useMyEvents() {
  const client = useAuthenticatedSupabase();
  return useQuery({
    queryKey: ['events'],
    queryFn: () => getMyEvents(client),
  });
}

export function useEvent(id: string | undefined) {
  const client = useAuthenticatedSupabase();
  return useQuery({
    queryKey: ['event', id],
    queryFn: () => getEventById(client, id!),
    enabled: !!id,
  });
}

export function useDashboardData() {
  const client = useAuthenticatedSupabase();
  return useQuery({
    queryKey: ['dashboard'],
    queryFn: () => getDashboardData(client),
  });
}
