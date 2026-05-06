import { NextResponse } from 'next/server'
import { createSupabaseAdminClient } from '@/lib/supabase'
import { getCurrentVendor } from '@/lib/vendor'

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  const { id } = await params

  const state = await getCurrentVendor()
  if (state.kind !== 'live') {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }
  const vendorId = state.vendor.id

  const supabase = createSupabaseAdminClient()

  // Verify inquiry belongs to this vendor
  const { data: inquiry } = await supabase
    .from('inquiries')
    .select('id, name, message, created_at')
    .eq('id', id)
    .eq('vendor_id', vendorId)
    .maybeSingle()

  if (!inquiry) {
    return NextResponse.json({ error: 'Inquiry not found' }, { status: 404 })
  }

  const { data: messages, error } = await supabase
    .from('inquiry_messages')
    .select('id, sender_type, sender_name, content, created_at, read_at')
    .eq('inquiry_id', id)
    .order('created_at', { ascending: true })

  if (error) {
    console.error('[vendor/inquiries/messages] GET failed', error)
    return NextResponse.json({ error: 'Failed to fetch messages' }, { status: 500 })
  }

  // Include the initial inquiry message so the vendor sees the full thread
  const initialMessage = inquiry.message
    ? {
        id: 'initial',
        sender_type: 'client' as const,
        sender_name: inquiry.name ?? 'Client',
        content: inquiry.message,
        created_at: inquiry.created_at,
        read_at: null,
      }
    : null

  const thread = [
    ...(initialMessage ? [initialMessage] : []),
    ...(messages ?? []),
  ].sort((a, b) => new Date(a.created_at).getTime() - new Date(b.created_at).getTime())

  return NextResponse.json({ messages: thread })
}

export async function POST(
  request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  const { id } = await params

  const state = await getCurrentVendor()
  if (state.kind !== 'live') {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }
  const vendorId = state.vendor.id
  const vendorName = state.vendor.businessName

  let body: unknown
  try {
    body = await request.json()
  } catch {
    return NextResponse.json({ error: 'Invalid JSON' }, { status: 400 })
  }

  const { content } = body as Record<string, unknown>
  if (!content || typeof content !== 'string' || !content.trim()) {
    return NextResponse.json({ error: 'Message content is required' }, { status: 400 })
  }

  const supabase = createSupabaseAdminClient()

  // Confirm inquiry belongs to this vendor
  const { data: existing } = await supabase
    .from('inquiries')
    .select('id')
    .eq('id', id)
    .eq('vendor_id', vendorId)
    .maybeSingle()

  if (!existing) {
    return NextResponse.json({ error: 'Inquiry not found' }, { status: 404 })
  }

  const { data: message, error: insertErr } = await supabase
    .from('inquiry_messages')
    .insert({
      inquiry_id: id,
      sender_type: 'vendor',
      sender_name: vendorName,
      content: content.trim(),
    })
    .select('id, sender_type, sender_name, content, created_at, read_at')
    .single()

  if (insertErr || !message) {
    console.error('[vendor/inquiries/messages] POST failed', insertErr)
    return NextResponse.json({ error: 'Failed to send message' }, { status: 500 })
  }

  // Update inquiry status to responded if it was pending
  await supabase
    .from('inquiries')
    .update({ status: 'responded', responded_at: new Date().toISOString(), updated_at: new Date().toISOString() })
    .eq('id', id)
    .eq('status', 'pending')

  return NextResponse.json({ message }, { status: 201 })
}
