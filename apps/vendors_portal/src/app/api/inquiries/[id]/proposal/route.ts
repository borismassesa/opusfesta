import { NextResponse } from 'next/server'
import { createSupabaseAdminClient } from '@/lib/supabase'
import { getCurrentVendor } from '@/lib/vendor'
import { createBookingFromInquiry } from '@/lib/booking-from-inquiry'
import { notifyLeadEventEmail } from '@/lib/email/notify-leads-bookings'

type ProposalAction = 'send' | 'accept-counter'

function parsePositiveInteger(value: unknown) {
  if (typeof value === 'number' && Number.isInteger(value) && value > 0) return value
  if (typeof value === 'string' && value.trim()) {
    const parsed = Number.parseInt(value.trim(), 10)
    return Number.isInteger(parsed) && parsed > 0 ? parsed : null
  }
  return null
}

function parseProposalDraft(payload: Record<string, unknown>) {
  const invoiceAmount = parsePositiveInteger(payload.invoiceAmount)
  return {
    invoiceAmount,
    guestCount: parsePositiveInteger(payload.guestCount),
    eventDate:
      typeof payload.eventDate === 'string' && payload.eventDate.trim()
        ? payload.eventDate.trim()
        : null,
    venue: typeof payload.venue === 'string' ? payload.venue.trim() : '',
    packageName: typeof payload.packageName === 'string' ? payload.packageName.trim() : '',
    invoiceDetails:
      typeof payload.invoiceDetails === 'string' ? payload.invoiceDetails.trim() : '',
  }
}

async function sendProposal(
  supabase: ReturnType<typeof createSupabaseAdminClient>,
  inquiryId: string,
  vendorName: string,
  inquiry: {
    email: string | null
    name: string | null
  },
  priorStatus: string | null,
  payload: Record<string, unknown>,
) {
  const draft = parseProposalDraft(payload)
  if (!draft.invoiceAmount) {
    return NextResponse.json({ error: 'Valid invoice amount is required' }, { status: 400 })
  }

  const now = new Date().toISOString()
  const { error } = await supabase
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
      status: priorStatus === 'accepted' ? 'accepted' : 'responded',
      responded_at: now,
      updated_at: now,
    })
    .eq('id', inquiryId)

  if (error) {
    console.error('[vendor/inquiries/proposal] send failed', error)
    return NextResponse.json({ error: 'Failed to save proposal' }, { status: 500 })
  }

  void notifyLeadEventEmail({
    recipientEmail: inquiry.email,
    recipientName: inquiry.name,
    vendorName,
    inquiryId,
    statusLabel: 'Proposal sent',
    eventDate: draft.eventDate,
    amountTzs: draft.invoiceAmount,
  })

  return NextResponse.json({ success: true })
}

async function acceptCounter(
  supabase: ReturnType<typeof createSupabaseAdminClient>,
  inquiryId: string,
  vendorName: string,
  inquiry: {
    vendor_id: string
    user_id: string | null
    name: string | null
    email: string | null
    phone: string | null
    proposal_event_date: string | null
    proposal_venue: string | null
    proposal_package: string | null
    proposal_invoice_amount: number | null
    proposal_counter_amount: number | null
  },
) {
  const now = new Date().toISOString()
  const { error } = await supabase
    .from('inquiries')
    .update({
      proposal_status: 'accepted',
      proposal_invoice_amount: inquiry.proposal_counter_amount ?? inquiry.proposal_invoice_amount,
      proposal_accepted_at: now,
      status: 'accepted',
      updated_at: now,
    })
    .eq('id', inquiryId)

  if (error) {
    console.error('[vendor/inquiries/proposal] accept counter failed', error)
    return NextResponse.json({ error: 'Failed to accept counter' }, { status: 500 })
  }

  await createBookingFromInquiry(supabase, {
    id: inquiryId,
    vendor_id: inquiry.vendor_id,
    user_id: inquiry.user_id,
    name: inquiry.name,
    email: inquiry.email,
    phone: inquiry.phone,
    proposal_event_date: inquiry.proposal_event_date,
    proposal_venue: inquiry.proposal_venue,
    proposal_package: inquiry.proposal_package,
    // Use the counter amount since that's what was accepted
    proposal_invoice_amount: inquiry.proposal_counter_amount ?? inquiry.proposal_invoice_amount,
    proposal_counter_amount: null,
  })

  void notifyLeadEventEmail({
    recipientEmail: inquiry.email,
    recipientName: inquiry.name,
    vendorName,
    inquiryId,
    statusLabel: 'Counter offer accepted',
    eventDate: inquiry.proposal_event_date,
    amountTzs: inquiry.proposal_counter_amount ?? inquiry.proposal_invoice_amount,
  })

  return NextResponse.json({ success: true })
}

export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  const { id } = await params

  const state = await getCurrentVendor()
  if (state.kind !== 'live') {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  let body: unknown
  try {
    body = await request.json()
  } catch {
    return NextResponse.json({ error: 'Invalid JSON body' }, { status: 400 })
  }

  const payload = body as Record<string, unknown>
  const action = payload.action as ProposalAction | undefined
  if (action !== 'send' && action !== 'accept-counter') {
    return NextResponse.json({ error: 'Unsupported proposal action' }, { status: 400 })
  }

  const supabase = createSupabaseAdminClient()
  const { data: inquiry, error: inquiryErr } = await supabase
    .from('inquiries')
    .select('id, vendor_id, user_id, name, email, phone, proposal_status, proposal_event_date, proposal_venue, proposal_package, proposal_invoice_amount, proposal_counter_amount')
    .eq('id', id)
    .eq('vendor_id', state.vendor.id)
    .maybeSingle<{
      id: string
      vendor_id: string
      user_id: string | null
      name: string | null
      email: string | null
      phone: string | null
      proposal_status: string | null
      proposal_event_date: string | null
      proposal_venue: string | null
      proposal_package: string | null
      proposal_invoice_amount: number | null
      proposal_counter_amount: number | null
    }>()

  if (inquiryErr) {
    console.error('[vendor/inquiries/proposal] lookup failed', inquiryErr.code)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
  if (!inquiry) {
    return NextResponse.json({ error: 'Inquiry not found' }, { status: 404 })
  }

  if (action === 'send') {
    return sendProposal(
      supabase,
      id,
      state.vendor.businessName,
      { email: inquiry.email, name: inquiry.name },
      inquiry.proposal_status,
      payload,
    )
  }

  if (inquiry.proposal_status !== 'countered') {
    return NextResponse.json({ error: 'No client counter to accept' }, { status: 400 })
  }

  return acceptCounter(supabase, id, state.vendor.businessName, inquiry)
}