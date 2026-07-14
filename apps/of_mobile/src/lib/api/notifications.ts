import type { SupabaseClient } from '@supabase/supabase-js';

export interface NotificationItem {
  id: string;
  type: string;
  title: string;
  body: string | null;
  read: boolean;
  href: string | null;
  created_at: string;
}

export async function getNotifications(client: SupabaseClient): Promise<NotificationItem[]> {
  const { data, error } = await client
    .from('notifications')
    .select('*')
    .order('created_at', { ascending: false })
    .limit(50);

  if (error) throw error;
  return (data ?? []) as NotificationItem[];
}

export async function getUnreadNotificationCount(client: SupabaseClient) {
  const { count, error } = await client
    .from('notifications')
    .select('id', { count: 'exact', head: true })
    .eq('read', false);

  if (error) throw error;
  return count ?? 0;
}

export async function markNotificationRead(client: SupabaseClient, id: string) {
  const { error } = await client.from('notifications').update({ read: true }).eq('id', id);
  if (error) throw error;
}

export async function markAllNotificationsRead(client: SupabaseClient) {
  const { error } = await client.from('notifications').update({ read: true }).eq('read', false);
  if (error) throw error;
}
