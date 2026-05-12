import { NextResponse } from 'next/server'
import { createSupabaseAdminClient } from '@/lib/supabase'
import { getCurrentVendor } from '@/lib/vendor'
import { createBookingFromInquiry } from '@/lib/booking-from-inquiry'
import { notifyLeadEventEmail } from '@/lib/email/notify-leads-bookings'

const ALLOWED_STATUSES = ['responded', 'accepted', 'declined', 'closed'] as const
type AllowedStatus = (typeof ALLOWED_STATUSES)[number]

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  const { id } = await params

  const state = await getCurrentVendor()
  if (state.kind !== 'live') {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const supabase = createSupabaseAdminClient()
  const { data, error } = await supabase
    .from('inquiries')
    .select('id, name, email, phone, event_date, guest_count, budget, location, message, status, created_at, updated_at, proposal_status, proposal_event_date, proposal_venue, proposal_guest_count, proposal_package, proposal_invoice_amount, proposal_invoice_details, proposal_sent_at, proposal_counter_amount, proposal_counter_message, proposal_countered_at, proposal_accepted_at')
    .eq('id', id)
    .eq('vendor_id', state.vendor.id)
    .maybeSingle()

  if (error) {
    console.error('[inquiries] get failed', error)
    return NextResponse.json({ error: 'Failed to fetch inquiry' }, { status: 500 })
  }
  if (!data) {
    return NextResponse.json({ error: 'Inquiry not found' }, { status: 404 })
  }

  return NextResponse.json({ inquiry: data })
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
  const vendorId = state.vendor.id

  let body: unknown
  try {
    body = await request.json()
  } catch {
    return NextResponse.json({ error: 'Invalid JSON body' }, { status: 400 })
  }

  const { status, vendor_response } = body as Record<string, unknown>

  if (status !== undefined && !ALLOWED_STATUSES.includes(status as AllowedStatus)) {
    return NextResponse.json(
      { error: `status must be one of: ${ALLOWED_STATUSES.join(', ')}` },
      { status: 400 },
    )
  }

  // Confirm the inquiry belongs to this vendor before writing; fetch proposal
  // fields now so we can create a booking if status is moving to 'accepted'.
  const supabase = createSupabaseAdminClient()
  const { data: existing, error: ownerErr } = await supabase
    .from('inquiries')
    .select('id, vendor_id, user_id, name, email, phone, proposal_event_date, proposal_venue, proposal_package, proposal_invoice_amount, proposal_counter_amount')
    .eq('id', id)
    .eq('vendor_id', vendorId)
    .maybeSingle<{
      id: string
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
    }>()

  if (ownerErr) {
    console.error('[inquiries] ownership check failed', ownerErr.code)
    return NextResponse.json({ error: 'Failed to fetch inquiry' }, { status: 500 })
  }
  if (!existing) {
    return NextResponse.json({ error: 'Inquiry not found' }, { status: 404 })
  }

  const update: Record<string, unknown> = { updated_at: new Date().toISOString() }
  if (status) update.status = status
  if (typeof vendor_response === 'string' && vendor_response.trim()) {
    update.vendor_response = vendor_response.trim()
    update.responded_at = new Date().toISOString()
    if (!status) update.status = 'responded'
  }

  const { error } = await supabase
    .from('inquiries')
    .update(update)
    .eq('id', id)

  if (error) {
    console.error('[inquiries] update failed', error)
    return NextResponse.json({ error: 'Update failed. Please try again.' }, { status: 500 })
  }

  if (status) {
    const statusLabelMap: Record<AllowedStatus, string> = {
      responded: 'Response sent',
      accepted: 'Offer accepted',
      declined: 'Offer declined',
      closed: 'Lead closed',
    }
    void notifyLeadEventEmail({
      recipientEmail: existing.email,
      recipientName: existing.name,
      vendorName: state.vendor.businessName,
      inquiryId: existing.id,
      statusLabel: statusLabelMap[status as AllowedStatus],
      eventDate: existing.proposal_event_date,
      amountTzs: existing.proposal_counter_amount ?? existing.proposal_invoice_amount,
    })
  }

  // Promote to booking pipeline when vendor marks the inquiry as accepted.
  if (status === 'accepted') {
    try {
      await createBookingFromInquiry(supabase, existing)
    } catch (err) {
      console.error('[inquiries] createBookingFromInquiry failed', err)
    }
  }

  return NextResponse.json({ success: true })
}

export async function DELETE(
  _request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  const { id } = await params

  const state = await getCurrentVendor()
  if (state.kind !== 'live') {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const supabase = createSupabaseAdminClient()
  const { error } = await supabase
    .from('inquiries')
    .delete()
    .eq('id', id)
    .eq('vendor_id', state.vendor.id)

  if (error) {
    console.error('[inquiries] delete failed', error)
    return NextResponse.json({ error: 'Delete failed. Please try again.' }, { status: 500 })
  }

  return new NextResponse(null, { status: 204 })
}
