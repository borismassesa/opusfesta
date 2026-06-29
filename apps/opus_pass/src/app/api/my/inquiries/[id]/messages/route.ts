import { NextResponse, type NextRequest } from 'next/server'
import { auth, currentUser } from '@clerk/nextjs/server'
import { createSupabaseServerClient } from '@/lib/supabase'

const ATTACHMENT_BUCKET = 'inquiry-attachments'
const MAX_FILES = 6
const MAX_FILE_BYTES = 25 * 1024 * 1024 // 25MB
// Photos, videos, and common documents couples might share with a vendor.
const ALLOWED_TYPES = new Set([
  'image/jpeg', 'image/png', 'image/webp', 'image/gif', 'image/heic',
  'video/mp4', 'video/quicktime', 'video/webm',
  'application/pdf',
  'application/msword',
  'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
  'application/vnd.ms-excel',
  'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
  'text/plain', 'text/csv',
])

type Attachment = { url: string; name: string; type: string; size: number }

async function getAuthenticatedEmail(): Promise<string | null> {
  const { userId } = await auth()
  if (!userId) return null
  const clerkUser = await currentUser().catch(() => null)
  return clerkUser?.emailAddresses?.[0]?.emailAddress?.trim().toLowerCase() ?? null
}

function safeName(name: string): string {
  return name.replace(/[^\w.\-]+/g, '_').slice(-80) || 'file'
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

  // `select('*')` is intentional: it returns the `attachments` column when the
  // migration has been applied, and stays valid before it has (the key is just
  // absent), so the chat never breaks on the migration boundary.
  const { data: messages, error } = await supabase
    .from('inquiry_messages')
    .select('*')
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

  // The composer sends multipart form data: a text `content` field plus any
  // number of `files`.
  let content = ''
  let files: File[] = []
  try {
    const form = await request.formData()
    content = String(form.get('content') ?? '').trim()
    files = form.getAll('files').filter((f): f is File => f instanceof File && f.size > 0)
  } catch {
    return NextResponse.json({ error: 'Invalid form data' }, { status: 400 })
  }

  if (!content && files.length === 0) {
    return NextResponse.json({ error: 'Message content or an attachment is required' }, { status: 400 })
  }
  if (files.length > MAX_FILES) {
    return NextResponse.json({ error: `You can attach up to ${MAX_FILES} files` }, { status: 400 })
  }
  for (const file of files) {
    if (file.size > MAX_FILE_BYTES) {
      return NextResponse.json({ error: `"${file.name}" is larger than 25MB` }, { status: 400 })
    }
    if (file.type && !ALLOWED_TYPES.has(file.type)) {
      return NextResponse.json({ error: `"${file.name}" is not a supported file type` }, { status: 400 })
    }
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

  // Upload any attachments to the public bucket.
  const attachments: Attachment[] = []
  for (let i = 0; i < files.length; i += 1) {
    const file = files[i]
    const path = `${id}/${Date.now()}-${i}-${safeName(file.name)}`
    const { error: uploadErr } = await supabase.storage
      .from(ATTACHMENT_BUCKET)
      .upload(path, file, { contentType: file.type || 'application/octet-stream', upsert: false })
    if (uploadErr) {
      console.error('[my/inquiries/messages] attachment upload failed', uploadErr)
      return NextResponse.json({ error: 'Could not upload attachment. Please try again.' }, { status: 500 })
    }
    const { data: pub } = supabase.storage.from(ATTACHMENT_BUCKET).getPublicUrl(path)
    attachments.push({ url: pub.publicUrl, name: file.name, type: file.type || 'application/octet-stream', size: file.size })
  }

  // Only set `attachments` when present so a text-only message stays valid even
  // before the column migration has been applied.
  const insertPayload: Record<string, unknown> = {
    inquiry_id: id,
    sender_type: 'client',
    sender_name: inquiry.name,
    content,
  }
  if (attachments.length > 0) insertPayload.attachments = attachments

  const { data: message, error: insertErr } = await supabase
    .from('inquiry_messages')
    .insert(insertPayload)
    .select('*')
    .single()

  if (insertErr || !message) {
    console.error('[my/inquiries/messages] insert failed', insertErr)
    return NextResponse.json({ error: 'Failed to send message' }, { status: 500 })
  }

  return NextResponse.json({ message }, { status: 201 })
}
