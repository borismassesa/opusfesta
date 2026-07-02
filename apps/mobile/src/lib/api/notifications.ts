import type { SupabaseClient } from '@supabase/supabase-js';

export async function getNotifications(client: SupabaseClient) {
  const { data, error } = await client
    .from('notifications')
    .select('*')
    .order('created_at', { ascending: false })
    .limit(50);

  if (error) throw error;
  return data ?? [];
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
