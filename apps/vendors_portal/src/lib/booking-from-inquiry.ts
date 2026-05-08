import type { createSupabaseAdminClient } from './supabase'

type InquiryForBooking = {
  id: string
  vendor_id: string
  user_id?: string | null
  name: string | null
  email: string | null
  phone: string | null
  proposal_event_date: string | null
  proposal_venue: string | null
  proposal_package: string | null
  proposal_invoice_amount: number | null
  proposal_counter_amount?: number | null
}

// Creates a vendor_bookings record when a proposal is accepted.
// Idempotent: returns the existing booking id if one already exists for this inquiry.
// Returns null if required proposal data is missing or if the insert fails.
export async function createBookingFromInquiry(
  supabase: ReturnType<typeof createSupabaseAdminClient>,
  inquiry: InquiryForBooking,
): Promise<string | null> {
  if (!inquiry.proposal_event_date) return null

  const { data: existing, error: existingErr } = await supabase
    .from('vendor_bookings')
    .select('id')
    .eq('inquiry_id', inquiry.id)
    .maybeSingle<{ id: string }>()

  if (existingErr) console.error('[booking-from-inquiry] lookup failed', existingErr.code)
  if (existing) return existing.id

  // "Amani & Zuri" → partnerA = "Amani", partnerB = "Zuri"
  const parts = (inquiry.name ?? '').split(' & ')
  const partnerA = parts[0]?.trim() || 'Partner A'
  const partnerB = parts[1]?.trim() || 'Partner B'

  const value = inquiry.proposal_counter_amount ?? inquiry.proposal_invoice_amount ?? 0
  const now = new Date().toISOString()

  const { data, error } = await supabase
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
    .single<{ id: string }>()

  if (error) {
    console.error('[booking-from-inquiry] create failed', error)
    return null
  }

  return data.id
}
