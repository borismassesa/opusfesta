import { NextResponse, type NextRequest } from 'next/server'
import { createSupabaseServerClient } from '@/lib/supabase'

function isValidEmail(e: string) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(e)
}

function resolveEmail(request: NextRequest, body: Record<string, unknown>) {
  const bodyEmail = typeof body.email === 'string' ? body.email.trim().toLowerCase() : ''
  const queryEmail = request.nextUrl.searchParams.get('email')?.trim().toLowerCase() ?? ''
  const email = bodyEmail || queryEmail
  return isValidEmail(email) ? email : null
}

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string; messageId: string }> },
) {
  const { id, messageId } = await params

  let body: unknown
  try {
    body = await request.json()
  } catch {
    return NextResponse.json({ error: 'Invalid JSON' }, { status: 400 })
  }

  const payload = body as Record<string, unknown>
  const email = resolveEmail(request, payload)
  const content = payload.content

  if (!email) {
    return NextResponse.json({ error: 'Valid email is required' }, { status: 400 })
  }
  if (typeof content !== 'string' || !content.trim()) {
    return NextResponse.json({ error: 'Message content is required' }, { status: 400 })
  }

  const supabase = createSupabaseServerClient()

  const { data: inquiry } = await supabase
    .from('inquiries')
    .select('id')
    .eq('id', id)
    .eq('email', email)
    .maybeSingle()

  if (!inquiry) {
    return NextResponse.json({ error: 'Inquiry not found' }, { status: 404 })
  }

  const { data: message, error } = await supabase
    .from('inquiry_messages')
    .update({ content: content.trim() })
    .eq('id', messageId)
    .eq('inquiry_id', id)
    .eq('sender_type', 'client')
    .select('id, sender_type, sender_name, content, created_at, read_at')
    .maybeSingle()

  if (error) {
    console.error('[my/inquiries/messages/[messageId]] patch failed', error)
    return NextResponse.json({ error: 'Failed to update message' }, { status: 500 })
  }
  if (!message) {
    return NextResponse.json({ error: 'Message not found' }, { status: 404 })
  }

  return NextResponse.json({ message })
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string; messageId: string }> },
) {
  const { id, messageId } = await params
  const email = request.nextUrl.searchParams.get('email')?.trim().toLowerCase() ?? ''

  if (!isValidEmail(email)) {
    return NextResponse.json({ error: 'Valid email is required' }, { status: 400 })
  }

  const supabase = createSupabaseServerClient()

  const { data: inquiry } = await supabase
    .from('inquiries')
    .select('id')
    .eq('id', id)
    .eq('email', email)
    .maybeSingle()

  if (!inquiry) {
    return NextResponse.json({ error: 'Inquiry not found' }, { status: 404 })
  }

  const { error } = await supabase
    .from('inquiry_messages')
    .delete()
    .eq('id', messageId)
    .eq('inquiry_id', id)
    .eq('sender_type', 'client')

  if (error) {
    console.error('[my/inquiries/messages/[messageId]] delete failed', error)
    return NextResponse.json({ error: 'Failed to delete message' }, { status: 500 })
  }

  return new NextResponse(null, { status: 204 })
}
