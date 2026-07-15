import type { SupabaseClient } from '@supabase/supabase-js';
import type { InquiryRow } from '@/types/vendor';
import { INQUIRY_COLUMNS } from './vendorLeads';

// Mirrors vendors_portal's proposal route (api/inquiries/[id]/proposal):
// the vendor's only two proposal actions are `send` (which doubles as a
// revised offer after a couple counter — it resets the counter fields) and
// `accept-counter`. The couple counters/accepts via opus_website/opus_pass.

export interface ProposalDraft {
  eventDate: string | null;
  venue: string;
  guestCount: number | null;
  packageName: string;
  invoiceAmount: number;
  invoiceDetails: string;
}

export async function sendProposal(
  client: SupabaseClient,
  inquiry: Pick<InquiryRow, 'id' | 'status'>,
  draft: ProposalDraft
): Promise<InquiryRow> {
  const now = new Date().toISOString();
  const { data, error } = await client
    .from('inquiries')
    .update({
      proposal_status: 'sent',
      proposal_event_date: draft.eventDate,
      proposal_venue: draft.venue || null,
      proposal_guest_count: draft.guestCount,
      proposal_package: draft.packageName || null,
      proposal_invoice_amount: draft.invoiceAmount,
      proposal_invoice_details: draft.invoiceDetails || null,
      proposal_sent_at: now,
      proposal_counter_amount: null,
      proposal_counter_message: null,
      proposal_countered_at: null,
      proposal_accepted_at: null,
      status: inquiry.status === 'accepted' ? 'accepted' : 'responded',
      responded_at: now,
      updated_at: now,
    })
    .eq('id', inquiry.id)
    .select(INQUIRY_COLUMNS)
    .single();

  if (error) throw error;

  // Fire-and-forget push to the couple — never blocks or fails the send.
  client.functions.invoke('send-push', { body: { event: 'inquiry_response', inquiryId: inquiry.id } }).catch(() => {});

  return data as InquiryRow;
}

// Creates the vendor_bookings row for an accepted proposal, mirroring
// vendors_portal's booking-from-inquiry. Idempotent on inquiry_id. Returns
// null when required proposal data is missing. vendor_bookings INSERT RLS
// only permits owner/manager — gate the accept action accordingly in the UI.
async function createBookingFromInquiry(client: SupabaseClient, inquiry: InquiryRow): Promise<string | null> {
  if (!inquiry.proposal_event_date) return null;

  const { data: existing, error: existingError } = await client
    .from('vendor_bookings')
    .select('id')
    .eq('inquiry_id', inquiry.id)
    .maybeSingle();
  if (existingError) throw existingError;
  if (existing) return existing.id;

  // "Amani & Zuri" → partnerA = "Amani", partnerB = "Zuri"
  const parts = (inquiry.name ?? '').split(' & ');
  const partnerA = parts[0]?.trim() || 'Partner A';
  const partnerB = parts[1]?.trim() || 'Partner B';

  const value = inquiry.proposal_counter_amount ?? inquiry.proposal_invoice_amount ?? 0;
  const now = new Date().toISOString();

  const { data, error } = await client
    .from('vendor_bookings')
    .insert({
      vendor_id: inquiry.vendor_id,
      inquiry_id: inquiry.id,
      client_user_id: inquiry.user_id ?? null,
      event_date: inquiry.proposal_event_date,
      start_time: '09:00',
      end_time: '18:00',
      partner_a: partnerA,
      partner_b: partnerB,
      phone: inquiry.phone ?? null,
      whatsapp: inquiry.phone ?? null,
      email: inquiry.email ?? null,
      package_name: inquiry.proposal_package ?? 'TBC',
      location: inquiry.proposal_venue ?? 'TBC',
      total_value: value,
      deposit_percent: 50,
      stage: 'reserved',
      internal_status: 'quote_accepted',
      timeline: [
        {
          at: now,
          kind: 'quote_accepted',
          label: `Proposal accepted · TZS ${value.toLocaleString('en-GB')}`,
        },
      ],
    })
    .select('id')
    .single();

  if (error) throw error;
  return data.id;
}

export async function acceptCounter(client: SupabaseClient, inquiry: InquiryRow): Promise<InquiryRow> {
  const now = new Date().toISOString();
  const acceptedAmount = inquiry.proposal_counter_amount ?? inquiry.proposal_invoice_amount;

  const { data, error } = await client
    .from('inquiries')
    .update({
      proposal_status: 'accepted',
      proposal_invoice_amount: acceptedAmount,
      proposal_accepted_at: now,
      status: 'accepted',
      updated_at: now,
    })
    .eq('id', inquiry.id)
    .select(INQUIRY_COLUMNS)
    .single();

  if (error) throw error;

  await createBookingFromInquiry(client, {
    ...inquiry,
    // Book at the accepted (counter) amount, same as vendors_portal.
    proposal_invoice_amount: acceptedAmount,
    proposal_counter_amount: null,
  });

  client.functions.invoke('send-push', { body: { event: 'inquiry_response', inquiryId: inquiry.id } }).catch(() => {});

  return data as InquiryRow;
}
