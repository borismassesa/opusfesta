import type { SupabaseClient } from '@supabase/supabase-js';

export async function upsertPushToken(
  client: SupabaseClient,
  userId: string,
  token: string,
  platform: 'ios' | 'android'
) {
  const { error } = await client
    .from('push_device_tokens')
    .upsert({ user_id: userId, token, platform }, { onConflict: 'user_id,token' });

  if (error) throw error;
}
