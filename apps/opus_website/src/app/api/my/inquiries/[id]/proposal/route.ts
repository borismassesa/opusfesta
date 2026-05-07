import { NextResponse, type NextRequest } from 'next/server'
import { auth, currentUser } from '@clerk/nextjs/server'
import { createSupabaseServerClient } from '@/lib/supabase'

type ProposalAction = 'accept' | 'counter'

function parsePositiveInteger(value: unknown) {
  if (typeof value === 'number' && Number.isInteger(value) && value > 0) return value
  if (typeof value === 'string' && value.trim()) {
    const parsed = Number.parseInt(value.trim(), 10)
    return Number.isInteger(parsed) && parsed > 0 ? parsed : null
  }
  return null
}

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  const { id } = await params

  const { userId } = await auth()
  if (!userId) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const clerkUser = await currentUser().catch(() => null)
  const email = clerkUser?.emailAddresses?.[0]?.emailAddress?.trim().toLowerCase()
  if (!email) {
    return NextResponse.json({ error: 'Could not resolve user email' }, { status: 400 })
  }

  let body: unknown
  try {
    body = await request.json()
  } catch {
    return NextResponse.json({ error: 'Invalid JSON' }, { status: 400 })
  }

  const payload = body as Record<string, unknown>

  const action = payload.action as ProposalAction | undefined
  if (action !== 'accept' && action !== 'counter') {
    return NextResponse.json({ error: 'Unsupported proposal action' }, { status: 400 })
  }

  const supabase = createSupabaseServerClient()
  const { data: inquiry, error: lookupErr } = await supabase
    .from('inquiries')
    .select('id, proposal_status, proposal_invoice_amount')
    .eq('id', id)
    .eq('email', email)
    .maybeSingle()

  if (lookupErr || !inquiry) {
    return NextResponse.json({ error: 'Inquiry not found' }, { status: 404 })
  }
  if (inquiry.proposal_status !== 'sent') {
    return NextResponse.json({ error: 'No pending proposal to respond to' }, { status: 400 })
  }

  const now = new Date().toISOString()

  if (action === 'accept') {
    const { error } = await supabase
      .from('inquiries')
      .update({
        proposal_status: 'accepted',
        proposal_accepted_at: now,
        status: 'accepted',
        updated_at: now,
      })
      .eq('id', id)
      .eq('email', email)

    if (error) {
      console.error('[my/inquiries/proposal] accept failed', error)
      return NextResponse.json({ error: 'Failed to accept proposal' }, { status: 500 })
    }

    return NextResponse.json({ success: true })
  }

  const counterAmount = parsePositiveInteger(payload.counterAmount)
  const counterMessage = typeof payload.counterMessage === 'string' ? payload.counterMessage.trim() : ''
  if (!counterAmount && !counterMessage) {
    return NextResponse.json({ error: 'Add a counter amount or a note' }, { status: 400 })
  }

  const { error } = await supabase
    .from('inquiries')
    .update({
      proposal_status: 'countered',
      proposal_counter_amount: counterAmount ?? inquiry.proposal_invoice_amount ?? null,
      proposal_counter_message: counterMessage || null,
      proposal_countered_at: now,
      updated_at: now,
    })
    .eq('id', id)
    .eq('email', email)

  if (error) {
    console.error('[my/inquiries/proposal] counter failed', error)
    return NextResponse.json({ error: 'Failed to submit counter' }, { status: 500 })
  }

  return NextResponse.json({ success: true })
}