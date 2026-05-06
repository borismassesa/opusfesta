import { randomUUID } from 'crypto'
import { NextResponse, type NextRequest } from 'next/server'
import { createSupabaseAdminClient } from '@/lib/supabase'
import { requireContributorIdentity } from '@/lib/contribute/auth'
import { findOwnedContributorDraft } from '@/lib/contribute/drafts'
import { isEditableContributorStatus } from '@/lib/contribute/types'

type RouteContext = { params: Promise<{ id: string }> }

const ACCEPTED_TYPES = new Set(['image/png', 'image/jpeg', 'image/webp', 'image/gif'])
const MAX_SIZE = 10 * 1024 * 1024

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
      return NextResponse.json({ error: 'No image file provided.' }, { status: 400 })
    }
    if (!ACCEPTED_TYPES.has(file.type)) {
      return NextResponse.json({ error: 'Use a PNG, JPEG, WebP, or GIF image.' }, { status: 415 })
    }
    if (file.size > MAX_SIZE) {
      return NextResponse.json({ error: 'Body images must be 10MB or smaller.' }, { status: 413 })
    }

    const extension =
      file.type === 'image/png'
        ? 'png'
        : file.type === 'image/webp'
          ? 'webp'
          : file.type === 'image/gif'
            ? 'gif'
            : 'jpg'
    const path = `${identity.clerkId}/${id}/body/${Date.now()}-${randomUUID()}.${extension}`
    const supabase = createSupabaseAdminClient()
    const { error } = await supabase.storage.from('submission-covers').upload(path, file, {
      contentType: file.type,
      upsert: false,
    })
    if (error) throw error

    const { data } = supabase.storage.from('submission-covers').getPublicUrl(path)
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
