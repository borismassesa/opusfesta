import type { SupabaseClient } from '@supabase/supabase-js';

export interface VendorConversationThread {
  id: string;
  last_message: string | null;
  updated_at: string;
  unread_count: number | null;
  users: { id: string; name: string | null; avatar: string | null } | null;
}

// Sibling to getConversations in messages.ts, not a branch inside it - that
// one joins vendors:vendor_id (correct for a couple's view, since it shows
// which vendor the thread is with); this joins users:user_id so a vendor
// sees the couple's identity instead of their own business. getMessages/
// sendMessage are unchanged and shared between both perspectives.
export async function getVendorConversations(client: SupabaseClient, vendorId: string): Promise<VendorConversationThread[]> {
  const { data, error } = await client
    .from('message_threads')
    .select(`
      *,
      users:user_id (id, name, avatar)
    `)
    .eq('vendor_id', vendorId)
    .order('updated_at', { ascending: false });

  if (error) throw error;
  return (data ?? []) as unknown as VendorConversationThread[];
}
