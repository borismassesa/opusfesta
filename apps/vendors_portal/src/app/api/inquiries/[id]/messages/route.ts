import { NextResponse } from 'next/server'
import { createSupabaseAdminClient } from '@/lib/supabase'
import { getCurrentVendor } from '@/lib/vendor'

const ATTACHMENT_BUCKET = 'inquiry-attachments'
const MAX_FILES = 6
const MAX_FILE_BYTES = 25 * 1024 * 1024 // 25MB
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

function safeName(name: string): string {
  return name.replace(/[^\w.\-]+/g, '_').slice(-80) || 'file'
}

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
  const { data: inquiry, error: inquiryErr } = await supabase
    .from('inquiries')
    .select('id, name, message, created_at')
    .eq('id', id)
    .eq('vendor_id', vendorId)
    .maybeSingle()

  if (inquiryErr) {
    console.error('[vendor/inquiries/messages] GET inquiry lookup failed', inquiryErr.code)
    return NextResponse.json({ error: 'Failed to fetch inquiry' }, { status: 500 })
  }
  if (!inquiry) {
    return NextResponse.json({ error: 'Inquiry not found' }, { status: 404 })
  }

  // `select('*')` returns the `attachments` column once the migration is applied
  // (and stays valid before it) so vendors can see images/files couples send.
  const { data: messages, error } = await supabase
    .from('inquiry_messages')
    .select('*')
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

  // Multipart form: text `content` plus any number of `files`.
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

  const supabase = createSupabaseAdminClient()

  // Confirm inquiry belongs to this vendor
  const { data: existing, error: existingErr } = await supabase
    .from('inquiries')
    .select('id')
    .eq('id', id)
    .eq('vendor_id', vendorId)
    .maybeSingle()

  if (existingErr) {
    console.error('[vendor/inquiries/messages] POST inquiry lookup failed', existingErr.code)
    return NextResponse.json({ error: 'Failed to fetch inquiry' }, { status: 500 })
  }
  if (!existing) {
    return NextResponse.json({ error: 'Inquiry not found' }, { status: 404 })
  }

  // Upload any attachments to the shared public bucket.
  const attachments: Attachment[] = []
  for (let i = 0; i < files.length; i += 1) {
    const file = files[i]
    const path = `${id}/${Date.now()}-${i}-${safeName(file.name)}`
    const { error: uploadErr } = await supabase.storage
      .from(ATTACHMENT_BUCKET)
      .upload(path, file, { contentType: file.type || 'application/octet-stream', upsert: false })
    if (uploadErr) {
      console.error('[vendor/inquiries/messages] attachment upload failed', uploadErr)
      return NextResponse.json({ error: 'Could not upload attachment. Please try again.' }, { status: 500 })
    }
    const { data: pub } = supabase.storage.from(ATTACHMENT_BUCKET).getPublicUrl(path)
    attachments.push({ url: pub.publicUrl, name: file.name, type: file.type || 'application/octet-stream', size: file.size })
  }

  // Only set `attachments` when present so a text-only reply stays valid even
  // before the column migration has been applied.
  const insertPayload: Record<string, unknown> = {
    inquiry_id: id,
    sender_type: 'vendor',
    sender_name: vendorName,
    content,
  }
  if (attachments.length > 0) insertPayload.attachments = attachments

  const { data: message, error: insertErr } = await supabase
    .from('inquiry_messages')
    .insert(insertPayload)
    .select('*')
    .single()

  if (insertErr || !message) {
    console.error('[vendor/inquiries/messages] POST failed', insertErr)
    return NextResponse.json({ error: 'Failed to send message' }, { status: 500 })
  }

  // Update inquiry status to responded if it was pending
  const { error: statusErr } = await supabase
    .from('inquiries')
    .update({ status: 'responded', responded_at: new Date().toISOString(), updated_at: new Date().toISOString() })
    .eq('id', id)
    .eq('status', 'pending')
  if (statusErr) console.error('[vendor/inquiries/messages] status update failed', statusErr.code)

  return NextResponse.json({ message }, { status: 201 })
}
