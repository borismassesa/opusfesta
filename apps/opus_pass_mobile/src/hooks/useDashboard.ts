import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { useAuthenticatedSupabase } from '@/lib/supabase';
import {
  enablePublicSharing,
  getCoupleProfile,
  getDashboardStats,
  getUpcomingEvents,
  setWeddingDate,
} from '@/lib/api/dashboard';

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

/** Sets the couple's wedding date — every checklist due date derives from it. */
export function useSetWeddingDate() {
  const client = useAuthenticatedSupabase();
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (weddingDate: string | null) => setWeddingDate(client, weddingDate),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['dashboard', 'couple-profile'] });
    },
  });
}

/** Turns on the couple's public invite link, generating a slug on first use. */
export function useEnablePublicSharing() {
  const client = useAuthenticatedSupabase();
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: () => enablePublicSharing(client),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['dashboard', 'couple-profile'] });
    },
  });
}
