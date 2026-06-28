'use server'

import { randomUUID } from 'node:crypto'
import { createSupabaseAdminClient } from '@/lib/supabase'
import { notifyAdminOfDocumentUpload } from '@/lib/email/document-upload-notify'

// Public (no-login) upload in response to an admin document request. Authorized
// solely by the per-request token in the URL — validated against the
// vendor_document_requests row via the service-role client.

export type SubmitResult = { ok: true } | { ok: false; error: string }

const ACCEPTED_MIMES = new Set([
  'image/jpeg',
  'image/png',
  'image/webp',
  'application/pdf',
])
const MAX_BYTES = 25 * 1024 * 1024 // 25MB — matches the storage bucket limit
const EXT_BY_MIME: Record<string, string> = {
  'image/jpeg': 'jpg',
  'image/png': 'png',
  'image/webp': 'webp',
  'application/pdf': 'pdf',
}

type RequestRow = {
  id: string
  vendor_id: string
  title: string
  status: 'pending' | 'submitted' | 'completed' | 'cancelled'
  expires_at: string
}

export async function submitDocumentRequest(
  token: string,
  formData: FormData,
): Promise<SubmitResult> {
  const admin = createSupabaseAdminClient()

  const { data: req, error: lookupErr } = await admin
    .from('vendor_document_requests')
    .select('id, vendor_id, title, status, expires_at')
    .eq('token', token)
    .maybeSingle<RequestRow>()

  if (lookupErr || !req) return { ok: false, error: 'This upload link is not valid.' }
  if (req.status === 'completed' || req.status === 'cancelled') {
    return { ok: false, error: 'This request has already been closed.' }
  }
  if (new Date(req.expires_at) < new Date()) {
    return { ok: false, error: 'This upload link has expired. Ask your contact for a fresh one.' }
  }

  const file = formData.get('file')
  if (!(file instanceof File) || file.size === 0) {
    return { ok: false, error: 'Choose a file to upload.' }
  }
  if (file.size > MAX_BYTES) {
    return { ok: false, error: 'File is over 25MB. Compress or trim it before uploading.' }
  }
  if (!ACCEPTED_MIMES.has(file.type)) {
    return { ok: false, error: 'Upload a PDF, JPG, PNG, or WEBP file.' }
  }
  const note = (formData.get('note') as string | null)?.trim() || null

  const ext = EXT_BY_MIME[file.type]
  const buffer = Buffer.from(await file.arrayBuffer())
  const storagePath = `${req.vendor_id}/document_request/${req.id}/${randomUUID()}.${ext}`

  const upload = await admin.storage
    .from('vendor_verification')
    .upload(storagePath, buffer, { contentType: file.type, upsert: false })
  if (upload.error) {
    console.error(`[upload] storage upload failed: ${upload.error.message}`)
    return { ok: false, error: 'Upload failed. Please try again.' }
  }

  const { error: updErr } = await admin
    .from('vendor_document_requests')
    .update({
      storage_path: storagePath,
      original_filename: file.name.slice(0, 255),
      mime_type: file.type,
      size_bytes: file.size,
      response_note: note,
      status: 'submitted',
      submitted_at: new Date().toISOString(),
    })
    .eq('id', req.id)

  if (updErr) {
    // Roll back the orphan storage object so we don't accumulate junk.
    await admin.storage.from('vendor_verification').remove([storagePath])
    return { ok: false, error: 'Could not save your upload. Please try again.' }
  }

  // Notify the admin team (best-effort; never blocks the vendor's success).
  const { data: vendor } = await admin
    .from('vendors')
    .select('business_name')
    .eq('id', req.vendor_id)
    .maybeSingle<{ business_name: string | null }>()
  await notifyAdminOfDocumentUpload({
    vendorId: req.vendor_id,
    businessName: vendor?.business_name?.trim() || 'A vendor',
    title: req.title,
    filename: file.name,
  })

  return { ok: true }
}
