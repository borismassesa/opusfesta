import { NextResponse, type NextRequest } from 'next/server'
import { createSupabaseServerClient } from '@/lib/supabase'

function isValidEmail(e: string) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(e)
}

export async function POST(
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

  const { email, content } = body as Record<string, unknown>

  if (!email || typeof email !== 'string' || !isValidEmail(email.trim())) {
    return NextResponse.json({ error: 'Valid email is required' }, { status: 400 })
  }
  if (!content || typeof content !== 'string' || !content.trim()) {
    return NextResponse.json({ error: 'Message content is required' }, { status: 400 })
  }

  const supabase = createSupabaseServerClient()

  const { data: inquiry, error: lookupErr } = await supabase
    .from('inquiries')
    .select('id, name, email')
    .eq('id', id)
    .eq('email', email.trim().toLowerCase())
    .maybeSingle()

  if (lookupErr || !inquiry) {
    return NextResponse.json({ error: 'Inquiry not found' }, { status: 404 })
  }

  const { data: message, error: insertErr } = await supabase
    .from('inquiry_messages')
    .insert({
      inquiry_id: id,
      sender_type: 'client',
      sender_name: inquiry.name,
      content: content.trim(),
    })
    .select('id, sender_type, sender_name, content, created_at, read_at')
    .single()

  if (insertErr || !message) {
    console.error('[my/inquiries/messages] insert failed', insertErr)
    return NextResponse.json({ error: 'Failed to send message' }, { status: 500 })
  }

  return NextResponse.json({ message }, { status: 201 })
}
