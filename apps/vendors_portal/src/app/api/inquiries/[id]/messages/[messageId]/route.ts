import { NextResponse } from 'next/server'
import { createSupabaseAdminClient } from '@/lib/supabase'
import { getCurrentVendor } from '@/lib/vendor'

export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ id: string; messageId: string }> },
) {
  const { id, messageId } = await params

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

  const content = (body as Record<string, unknown>).content
  if (typeof content !== 'string' || !content.trim()) {
    return NextResponse.json({ error: 'Message content is required' }, { status: 400 })
  }

  const supabase = createSupabaseAdminClient()

  const { data: inquiry } = await supabase
    .from('inquiries')
    .select('id')
    .eq('id', id)
    .eq('vendor_id', state.vendor.id)
    .maybeSingle()

  if (!inquiry) {
    return NextResponse.json({ error: 'Inquiry not found' }, { status: 404 })
  }

  const { data: message, error } = await supabase
    .from('inquiry_messages')
    .update({ content: content.trim() })
    .eq('id', messageId)
    .eq('inquiry_id', id)
    .eq('sender_type', 'vendor')
    .select('id, sender_type, sender_name, content, created_at, read_at')
    .maybeSingle()

  if (error) {
    console.error('[vendor/inquiries/messages/[messageId]] patch failed', error)
    return NextResponse.json({ error: 'Failed to update message' }, { status: 500 })
  }
  if (!message) {
    return NextResponse.json({ error: 'Message not found' }, { status: 404 })
  }

  return NextResponse.json({ message })
}

export async function DELETE(
  _request: Request,
  { params }: { params: Promise<{ id: string; messageId: string }> },
) {
  const { id, messageId } = await params

  const state = await getCurrentVendor()
  if (state.kind !== 'live') {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const supabase = createSupabaseAdminClient()

  const { data: inquiry } = await supabase
    .from('inquiries')
    .select('id')
    .eq('id', id)
    .eq('vendor_id', state.vendor.id)
    .maybeSingle()

  if (!inquiry) {
    return NextResponse.json({ error: 'Inquiry not found' }, { status: 404 })
  }

  const { error } = await supabase
    .from('inquiry_messages')
    .delete()
    .eq('id', messageId)
    .eq('inquiry_id', id)
    .eq('sender_type', 'vendor')

  if (error) {
    console.error('[vendor/inquiries/messages/[messageId]] delete failed', error)
    return NextResponse.json({ error: 'Failed to delete message' }, { status: 500 })
  }

  return new NextResponse(null, { status: 204 })
}
