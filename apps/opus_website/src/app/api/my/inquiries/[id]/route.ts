import { NextResponse, type NextRequest } from 'next/server'
import { createSupabaseServerClient } from '@/lib/supabase'

function isValidEmail(e: string) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(e)
}

function getValidatedEmail(request: NextRequest, fromBody?: unknown) {
  const bodyEmail = typeof fromBody === 'string' ? fromBody : ''
  const queryEmail = request.nextUrl.searchParams.get('email')?.trim().toLowerCase() ?? ''
  const email = (bodyEmail.trim().toLowerCase() || queryEmail)
  return isValidEmail(email) ? email : null
}

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  const { id } = await params
  const email = getValidatedEmail(request)

  if (!email) {
    return NextResponse.json({ error: 'Valid email is required' }, { status: 400 })
  }

  const supabase = createSupabaseServerClient()

  const { data: inquiry, error: inquiryErr } = await supabase
    .from('inquiries')
    .select(
      'id, vendor_name, vendor_slug, name, email, status, created_at, event_date, location, guest_count, budget, message, vendor_response, responded_at, proposal_status, proposal_event_date, proposal_venue, proposal_guest_count, proposal_package, proposal_invoice_amount, proposal_invoice_details, proposal_sent_at, proposal_counter_amount, proposal_counter_message, proposal_countered_at, proposal_accepted_at',
    )
    .eq('id', id)
    .eq('email', email)
    .maybeSingle()

  if (inquiryErr || !inquiry) {
    return NextResponse.json({ error: 'Inquiry not found' }, { status: 404 })
  }

  const { data: messages, error: msgErr } = await supabase
    .from('inquiry_messages')
    .select('id, sender_type, sender_name, content, created_at, read_at')
    .eq('inquiry_id', id)
    .order('created_at', { ascending: true })

  if (msgErr) {
    console.error('[my/inquiries/[id]] messages query failed', msgErr)
  }

  return NextResponse.json({ inquiry, messages: messages ?? [] })
}

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  const { id } = await params

  let body: unknown
  try {
    body = await request.json()
  } catch {
    return NextResponse.json({ error: 'Invalid JSON' }, { status: 400 })
  }

  const payload = body as Record<string, unknown>
  const email = getValidatedEmail(request, payload.email)
  if (!email) {
    return NextResponse.json({ error: 'Valid email is required' }, { status: 400 })
  }

  const nextStatus = payload.status
  if (nextStatus !== 'closed') {
    return NextResponse.json({ error: 'Only status "closed" is supported' }, { status: 400 })
  }

  const supabase = createSupabaseServerClient()
  const { error } = await supabase
    .from('inquiries')
    .update({ status: 'closed', updated_at: new Date().toISOString() })
    .eq('id', id)
    .eq('email', email)

  if (error) {
    console.error('[my/inquiries/[id]] update failed', error)
    return NextResponse.json({ error: 'Failed to update inquiry' }, { status: 500 })
  }

  return NextResponse.json({ success: true })
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  const { id } = await params
  const email = getValidatedEmail(request)

  if (!email) {
    return NextResponse.json({ error: 'Valid email is required' }, { status: 400 })
  }

  const supabase = createSupabaseServerClient()
  const { error } = await supabase
    .from('inquiries')
    .delete()
    .eq('id', id)
    .eq('email', email)

  if (error) {
    console.error('[my/inquiries/[id]] delete failed', error)
    return NextResponse.json({ error: 'Failed to delete inquiry' }, { status: 500 })
  }

  return new NextResponse(null, { status: 204 })
}
