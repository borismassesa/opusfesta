import type { SupabaseClient } from '@supabase/supabase-js';
import type { InquiryRow, InquiryStatus } from '@/types/vendor';

const INQUIRY_COLUMNS = `
  id, vendor_id, user_id, name, email, phone, event_type, event_date,
  guest_count, budget, location, message, status, vendor_response,
  responded_at, created_at
`;

export async function getVendorLeads(
  client: SupabaseClient,
  vendorId: string,
  status?: InquiryStatus | 'all'
): Promise<InquiryRow[]> {
  let query = client
    .from('inquiries')
    .select(INQUIRY_COLUMNS)
    .eq('vendor_id', vendorId)
    .order('created_at', { ascending: false });

  if (status && status !== 'all') {
    query = query.eq('status', status);
  }

  const { data, error } = await query;
  if (error) throw error;
  return (data ?? []) as InquiryRow[];
}

export async function getVendorLead(client: SupabaseClient, id: string): Promise<InquiryRow> {
  const { data, error } = await client.from('inquiries').select(INQUIRY_COLUMNS).eq('id', id).single();
  if (error) throw error;
  return data as InquiryRow;
}

export async function respondToLead(client: SupabaseClient, id: string, response: string): Promise<InquiryRow> {
  const { data, error } = await client
    .from('inquiries')
    .update({ vendor_response: response, status: 'responded', responded_at: new Date().toISOString() })
    .eq('id', id)
    .select(INQUIRY_COLUMNS)
    .single();

  if (error) throw error;
  return data as InquiryRow;
}

export async function updateLeadStatus(
  client: SupabaseClient,
  id: string,
  status: Extract<InquiryStatus, 'accepted' | 'declined' | 'closed'>
): Promise<InquiryRow> {
  // Accepting/declining auto-syncs vendor_availability via a DB trigger
  // (sync_inquiry_to_availability) - no client-side write needed there,
  // just invalidate the availability query on success (see useVendorLeads).
  const { data, error } = await client
    .from('inquiries')
    .update({ status })
    .eq('id', id)
    .select(INQUIRY_COLUMNS)
    .single();

  if (error) throw error;
  return data as InquiryRow;
}
