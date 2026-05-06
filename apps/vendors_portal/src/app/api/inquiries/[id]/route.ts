import { NextResponse } from 'next/server'
import { createSupabaseAdminClient } from '@/lib/supabase'
import { getCurrentVendor } from '@/lib/vendor'

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

  // Confirm the inquiry belongs to this vendor before writing
  const supabase = createSupabaseAdminClient()
  const { data: existing } = await supabase
    .from('inquiries')
    .select('id, vendor_id')
    .eq('id', id)
    .eq('vendor_id', vendorId)
    .maybeSingle()

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
