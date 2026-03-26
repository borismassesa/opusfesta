import type { SupabaseClient } from '@supabase/supabase-js';

export async function getConversations(client: SupabaseClient) {
  const { data, error } = await client
    .from('message_threads')
    .select(`
      *,
      vendors:vendor_id (id, business_name, logo)
    `)
    .order('updated_at', { ascending: false });

  if (error) throw error;
  return data ?? [];
}

export async function getMessages(client: SupabaseClient, threadId: string) {
  const { data, error } = await client
    .from('messages')
    .select('*')
    .eq('thread_id', threadId)
    .order('created_at', { ascending: true });

  if (error) throw error;
  return data ?? [];
}

export async function sendMessage(
  client: SupabaseClient,
  threadId: string,
  content: string
) {
  const { data, error } = await client
    .from('messages')
    .insert({ thread_id: threadId, content })
    .select()
    .single();

  if (error) throw error;
  return data;
}
