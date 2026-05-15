import { NextResponse, type NextRequest } from 'next/server'
import { auth, currentUser } from '@clerk/nextjs/server'
import { createSupabaseServerClient } from '@/lib/supabase'

async function getAuthenticatedEmail(): Promise<string | null> {
  const { userId } = await auth()
  if (!userId) return null
  const clerkUser = await currentUser().catch(() => null)
  return clerkUser?.emailAddresses?.[0]?.emailAddress?.trim().toLowerCase() ?? null
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
    .select('id')
    .eq('id', id)
    .eq('email', email)
    .maybeSingle()

  if (inquiryErr) {
    console.error('[my/inquiries/messages] query failed', inquiryErr)
    return NextResponse.json({ error: 'Database error' }, { status: 500 })
  }

  if (!inquiry) {
    return NextResponse.json({ error: 'Inquiry not found' }, { status: 404 })
  }

  const { data: messages, error } = await supabase
    .from('inquiry_messages')
    .select('id, sender_type, sender_name, content, created_at, read_at')
    .eq('inquiry_id', id)
    .order('created_at', { ascending: true })

  if (error) {
    console.error('[my/inquiries/messages] list failed', error)
    return NextResponse.json({ error: 'Failed to fetch messages' }, { status: 500 })
  }

  return NextResponse.json({ messages: messages ?? [] })
}

export async function POST(
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

  const { content } = body as Record<string, unknown>

  if (!content || typeof content !== 'string' || !content.trim()) {
    return NextResponse.json({ error: 'Message content is required' }, { status: 400 })
  }

  const supabase = createSupabaseServerClient()

  const { data: inquiry, error: lookupErr } = await supabase
    .from('inquiries')
    .select('id, name, email')
    .eq('id', id)
    .eq('email', email)
    .maybeSingle()

  if (lookupErr) {
    console.error('[my/inquiries/messages] lookup failed', lookupErr)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }

  if (!inquiry) {
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
