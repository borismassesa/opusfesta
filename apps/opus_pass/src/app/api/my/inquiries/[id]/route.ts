import { NextResponse, type NextRequest } from 'next/server'
import { auth, currentUser } from '@clerk/nextjs/server'
import { createSupabaseServerClient } from '@/lib/supabase'

// Couple-facing vendor inquiries. The data lives in the shared `inquiries` /
// `inquiry_messages` tables (same Supabase project as the marketplace) and is
// keyed by the couple's email, which we resolve from the Clerk session.

async function getAuthenticatedEmail(): Promise<string | null> {
  const { userId } = await auth()
  if (!userId) return null
  const user = await currentUser()
  const email = user?.emailAddresses.find(
    (e) => e.id === user.primaryEmailAddressId
  )?.emailAddress || user?.emailAddresses[0]?.emailAddress
  return email?.toLowerCase() || null
}

export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  const { id } = await params
  const email = await getAuthenticatedEmail()

  if (!email) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
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

  if (inquiryErr) {
    console.error('[my/inquiries/[id]] query failed', inquiryErr.code)
    return NextResponse.json({ error: 'Database error' }, { status: 500 })
  }

  if (!inquiry) {
    return NextResponse.json({ error: 'Inquiry not found' }, { status: 404 })
  }

  // `select('*')` returns the `attachments` column once the migration is applied
  // and stays valid before it (key just absent) — keeps chat safe either way.
  const { data: messages, error: msgErr } = await supabase
    .from('inquiry_messages')
    .select('*')
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
  const email = await getAuthenticatedEmail()

  if (!email) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  let body: unknown
  try {
    body = await request.json()
  } catch {
    return NextResponse.json({ error: 'Invalid JSON' }, { status: 400 })
  }

  const payload = body as Record<string, unknown>
  const nextStatus = payload.status
  if (nextStatus !== 'closed') {
    return NextResponse.json({ error: 'Only status "closed" is supported' }, { status: 400 })
  }

  const supabase = createSupabaseServerClient()
  const { data, error } = await supabase
    .from('inquiries')
    .update({ status: 'closed', updated_at: new Date().toISOString() })
    .eq('id', id)
    .eq('email', email)
    .select('id')

  if (error) {
    console.error('[my/inquiries/[id]] update failed', error)
    return NextResponse.json({ error: 'Failed to update inquiry' }, { status: 500 })
  }

  if (!data || data.length === 0) {
    return NextResponse.json({ error: 'Inquiry not found' }, { status: 404 })
  }

  return NextResponse.json({ success: true })
}

export async function DELETE(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  const { id } = await params
  const email = await getAuthenticatedEmail()

  if (!email) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const supabase = createSupabaseServerClient()
  const { data, error } = await supabase
    .from('inquiries')
    .delete()
    .eq('id', id)
    .eq('email', email)
    .select('id')

  if (error) {
    console.error('[my/inquiries/[id]] delete failed', error)
    return NextResponse.json({ error: 'Failed to delete inquiry' }, { status: 500 })
  }

  if (!data || data.length === 0) {
    return NextResponse.json({ error: 'Inquiry not found' }, { status: 404 })
  }

  return new NextResponse(null, { status: 204 })
}
