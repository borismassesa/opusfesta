import { useQuery } from '@tanstack/react-query';
import { useAuthenticatedSupabase } from '@/lib/supabase';
import { getCoupleProfile, getDashboardStats, getUpcomingEvents } from '@/lib/api/dashboard';

export function useDashboardStats() {
  const client = useAuthenticatedSupabase();
  return useQuery({
    queryKey: ['dashboard', 'stats'],
    queryFn: () => getDashboardStats(client),
  });
}

export function useCoupleProfile() {
  const client = useAuthenticatedSupabase();
  return useQuery({
    queryKey: ['dashboard', 'couple-profile'],
    queryFn: () => getCoupleProfile(client),
  });
}

export function useUpcomingEvents() {
  const client = useAuthenticatedSupabase();
  return useQuery({
    queryKey: ['dashboard', 'upcoming-events'],
    queryFn: () => getUpcomingEvents(client),
  });
}
