import { randomUUID } from 'crypto'
import { NextResponse, type NextRequest } from 'next/server'
import { requireAdminRole, type AdminAccessRole } from '@/lib/admin-auth'
import { createSupabaseAdminClient } from '@/lib/supabase'
import { slugify } from '@/lib/cms/advice-ideas'

const ARTICLE_WRITE_ROLES: AdminAccessRole[] = ['owner', 'admin', 'editor']
const ACCEPTED_IMAGE_TYPES = new Set(['image/png', 'image/jpeg', 'image/webp', 'image/gif'])
const ACCEPTED_VIDEO_TYPES = new Set([
  'video/mp4',
  'video/webm',
  'video/quicktime',
  'video/x-quicktime',
])
const MAX_IMAGE_SIZE = 25 * 1024 * 1024
const MAX_VIDEO_SIZE = 100 * 1024 * 1024

export async function POST(request: NextRequest) {
  try {
    await requireAdminRole(ARTICLE_WRITE_ROLES)

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
      return NextResponse.json({ error: 'Images must be 25MB or smaller.' }, { status: 413 })
    }
    if (isVideo && file.size > MAX_VIDEO_SIZE) {
      return NextResponse.json({ error: 'Videos must be 100MB or smaller.' }, { status: 413 })
    }

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
    const rawSlug = typeof formData.get('slug') === 'string' ? String(formData.get('slug')) : ''
    const slug = slugify(rawSlug || 'new') || 'new'
    const path = `advice-and-ideas/${slug}/${Date.now()}-${randomUUID()}.${extByMime[file.type] ?? 'bin'}`

    const supabase = createSupabaseAdminClient()
    const { error } = await supabase.storage
      .from('website-media')
      .upload(path, file, { contentType: file.type, upsert: false })
    if (error) throw error

    const { data } = supabase.storage.from('website-media').getPublicUrl(path)
    return NextResponse.json({
      url: data.publicUrl,
      type: isVideo ? 'video' : 'image',
    })
  } catch (error) {
    console.error('[operations articles media POST]', error)
    const message = error instanceof Error ? error.message : 'Upload failed.'
    const status = message.includes('Admin access') || message.includes('Unauthorized') ? 403 : 400
    return NextResponse.json({ error: message }, { status })
  }
}
