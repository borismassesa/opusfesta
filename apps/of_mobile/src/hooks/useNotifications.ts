import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { useAuthenticatedSupabase } from '@/lib/supabase';
import {
  getNotifications,
  getUnreadNotificationCount,
  markNotificationRead,
  markAllNotificationsRead,
} from '@/lib/api/notifications';

export function useNotifications() {
  const client = useAuthenticatedSupabase();
  return useQuery({
    queryKey: ['notifications'],
    queryFn: () => getNotifications(client),
  });
}

export function useUnreadNotificationCount() {
  const client = useAuthenticatedSupabase();
  return useQuery({
    queryKey: ['notifications-unread-count'],
    queryFn: () => getUnreadNotificationCount(client),
  });
}

export function useMarkNotificationRead() {
  const client = useAuthenticatedSupabase();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => markNotificationRead(client, id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['notifications'] });
      queryClient.invalidateQueries({ queryKey: ['notifications-unread-count'] });
    },
  });
}

export function useMarkAllNotificationsRead() {
  const client = useAuthenticatedSupabase();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: () => markAllNotificationsRead(client),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['notifications'] });
      queryClient.invalidateQueries({ queryKey: ['notifications-unread-count'] });
    },
  });
}
