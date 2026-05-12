import { randomUUID } from 'crypto'
import { NextResponse, type NextRequest } from 'next/server'
import { createSupabaseAdminClient } from '@/lib/supabase'
import { requireContributorIdentity } from '@/lib/contribute/auth'
import { findOwnedContributorDraft } from '@/lib/contribute/drafts'
import { isEditableContributorStatus } from '@/lib/contribute/types'

type RouteContext = { params: Promise<{ id: string }> }

const ACCEPTED_IMAGE_TYPES = new Set(['image/png', 'image/jpeg', 'image/webp', 'image/gif'])
const ACCEPTED_VIDEO_TYPES = new Set([
  'video/mp4',
  'video/webm',
  'video/quicktime',
  'video/x-quicktime',
])
const MAX_IMAGE_SIZE = 25 * 1024 * 1024 // 25 MB
const MAX_VIDEO_SIZE = 100 * 1024 * 1024 // 100 MB

export async function POST(request: NextRequest, context: RouteContext) {
  try {
    const { id } = await context.params
    const identity = await requireContributorIdentity()
    const draft = await findOwnedContributorDraft(id, identity)
    if (!draft) return NextResponse.json({ error: 'Not found.' }, { status: 404 })
    if (!isEditableContributorStatus(draft.status)) {
      return NextResponse.json({ error: 'This draft is locked.' }, { status: 423 })
    }

    const formData = await request.formData()
    const file = formData.get('file')
    if (!(file instanceof File)) {
      return NextResponse.json({ error: 'No file provided.' }, { status: 400 })
    }

    const isImage = ACCEPTED_IMAGE_TYPES.has(file.type)
    const isVideo = ACCEPTED_VIDEO_TYPES.has(file.type)
    if (!isImage && !isVideo) {
      return NextResponse.json(
        { error: 'Use an image (PNG, JPEG, WebP, GIF) or video (MP4, WebM, MOV).' },
        { status: 415 }
      )
    }
    if (isImage && file.size > MAX_IMAGE_SIZE) {
      return NextResponse.json({ error: 'Body images must be 25MB or smaller.' }, { status: 413 })
    }
    if (isVideo && file.size > MAX_VIDEO_SIZE) {
      return NextResponse.json({ error: 'Videos must be 100MB or smaller.' }, { status: 413 })
    }

    // Pick a sensible extension from the MIME (filename ext can be wrong).
    const extByMime: Record<string, string> = {
      'image/png': 'png',
      'image/jpeg': 'jpg',
      'image/webp': 'webp',
      'image/gif': 'gif',
      'video/mp4': 'mp4',
      'video/webm': 'webm',
      'video/quicktime': 'mov',
      'video/x-quicktime': 'mov',
    }
    const extension = extByMime[file.type] ?? 'bin'
    const path = `${identity.clerkId}/${id}/body/${Date.now()}-${randomUUID()}.${extension}`
    const supabase = createSupabaseAdminClient()
    const { error } = await supabase.storage.from('website-media').upload(path, file, {
      contentType: file.type,
      upsert: false,
    })
    if (error) throw error

    const { data } = supabase.storage.from('website-media').getPublicUrl(path)
    return NextResponse.json({ url: data.publicUrl })
  } catch (error) {
    console.error('[contribute draft media POST]', error)
    const message =
      error instanceof Error
        ? error.message
        : typeof error === 'object' && error !== null && 'message' in error
          ? String((error as { message: unknown }).message)
          : 'Upload failed.'
    const status = message.includes('Contributor access') ? 403 : message.includes('Sign in') ? 401 : 400
    return NextResponse.json({ error: message }, { status })
  }
}
