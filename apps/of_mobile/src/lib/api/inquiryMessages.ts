import type { SupabaseClient } from '@supabase/supabase-js';

// inquiry_messages is RLS-blocked for direct client access (by design — all
// apps go through service-role routes), so mobile reads and writes the
// thread through the inquiry-messages Edge Function. Response shapes mirror
// vendors_portal's api/inquiries/[id]/messages route.

export interface InquiryMessage {
  id: string;
  sender_type: 'client' | 'vendor';
  sender_name: string;
  content: string;
  attachments: { url: string; name: string; type: string; size: number }[] | null;
  created_at: string;
  read_at: string | null;
}

export async function getInquiryMessages(client: SupabaseClient, inquiryId: string): Promise<InquiryMessage[]> {
  const { data, error } = await client.functions.invoke('inquiry-messages', {
    body: { action: 'list', inquiryId },
  });
  if (error) throw error;
  return (data?.messages ?? []) as InquiryMessage[];
}

export async function sendInquiryMessage(
  client: SupabaseClient,
  inquiryId: string,
  content: string
): Promise<InquiryMessage> {
  const { data, error } = await client.functions.invoke('inquiry-messages', {
    body: { action: 'send', inquiryId, content },
  });
  if (error) throw error;
  return data.message as InquiryMessage;
}
