'use server'

import { requireAdminRole, type AdminAccessRole } from '@/lib/admin-auth'
import { createSupabaseAdminClient } from '@/lib/supabase'

// Vercel's serverless request-body cap (~4.5 MB at the time of writing)
// rejects larger payloads before the function runs and the browser surfaces
// the rejection as a generic "An unexpected response was received from the
// server." So every CMS image/video upload mints a signed Supabase Storage
// URL and the browser PUTs the file straight to Storage — same mechanism
// the vendor portfolio admin (`adminCreateVendorVideoUploadUrl`) uses, and
// like that helper this one gates on `requireAdminRole` because Server
// Actions are reachable as RPC endpoints regardless of route layout.

const CMS_UPLOAD_ROLES: AdminAccessRole[] = ['owner', 'admin', 'editor']

const IMAGE_MIME = new Set([
  'image/jpeg',
  'image/png',
  'image/webp',
  'image/gif',
  'image/avif',
  'image/svg+xml',
])
const SVG_MIME = 'image/svg+xml'
const VIDEO_MIME = new Set(['video/mp4', 'video/webm', 'video/quicktime'])
const MAX_BYTES = 500 * 1024 * 1024 // matches the website-media bucket cap

// Path-prefix sanity: lowercase segments, no leading slash, no '..'. Stops a
// malformed prefix from writing into another section's namespace.
const PREFIX_PATTERN = /^[a-z0-9][a-z0-9/_-]*[a-z0-9]$/

export type CmsMediaUploadUrlResult =
  | {
      ok: true
      uploadUrl: string
      token: string
      publicUrl: string
      path: string
      mediaType: 'image' | 'video'
    }
  | { ok: false; error: string }

export async function createCmsMediaUploadUrl(input: {
  pathPrefix: string
  filename: string
  mimeType: string
  sizeBytes: number
  kind: 'image' | 'svg' | 'video' | 'media'
}): Promise<CmsMediaUploadUrlResult> {
  await requireAdminRole(CMS_UPLOAD_ROLES)
  const isImage = IMAGE_MIME.has(input.mimeType)
  const isSvg = input.mimeType === SVG_MIME
  const isVideo = VIDEO_MIME.has(input.mimeType)
  if (input.kind === 'image' && !isImage) {
    return { ok: false, error: 'Only JPEG, PNG, WebP, GIF, AVIF, or SVG images are allowed.' }
  }
  if (input.kind === 'svg' && !isSvg) {
    return { ok: false, error: 'Only SVG files are allowed for this field.' }
  }
  if (input.kind === 'video' && !isVideo) {
    return { ok: false, error: 'Only MP4, WebM, or MOV video files are allowed.' }
  }
  if (input.kind === 'media' && !isImage && !isVideo) {
    return { ok: false, error: 'Only image or video files are allowed.' }
  }
  if (!Number.isFinite(input.sizeBytes) || input.sizeBytes <= 0) {
    return { ok: false, error: 'Missing file size.' }
  }
  if (input.sizeBytes > MAX_BYTES) {
    return {
      ok: false,
      error: `${input.filename}: file is over the 500 MB limit (${(input.sizeBytes / 1024 / 1024).toFixed(1)} MB).`,
    }
  }
  if (!PREFIX_PATTERN.test(input.pathPrefix) || input.pathPrefix.includes('..')) {
    return { ok: false, error: 'Invalid path prefix.' }
  }

  const ext = extFromMime(input.mimeType) ?? safeExt(input.filename)
  const path = `${input.pathPrefix}/${Date.now()}-${crypto.randomUUID()}.${ext}`
  const supabase = createSupabaseAdminClient()
  const signed = await supabase.storage
    .from('website-media')
    .createSignedUploadUrl(path)
  if (signed.error || !signed.data) {
    console.error('[cms-upload] createSignedUploadUrl failed', {
      path,
      mime: input.mimeType,
      size: input.sizeBytes,
      err: signed.error?.message,
    })
    return {
      ok: false,
      error: `Signed upload URL failed: ${signed.error?.message ?? 'unknown'}`,
    }
  }
  const publicUrl = supabase.storage.from('website-media').getPublicUrl(path)
  return {
    ok: true,
    uploadUrl: signed.data.signedUrl,
    token: signed.data.token,
    publicUrl: publicUrl.data.publicUrl,
    path,
    mediaType: isVideo ? 'video' : 'image',
  }
}

function extFromMime(mime: string): string | null {
  if (mime === 'image/jpeg') return 'jpg'
  if (mime === 'image/png') return 'png'
  if (mime === 'image/webp') return 'webp'
  if (mime === 'image/gif') return 'gif'
  if (mime === 'image/avif') return 'avif'
  if (mime === 'image/svg+xml') return 'svg'
  if (mime === 'video/mp4') return 'mp4'
  if (mime === 'video/webm') return 'webm'
  if (mime === 'video/quicktime') return 'mov'
  return null
}

function safeExt(filename: string): string {
  const raw = filename.split('.').pop() ?? 'bin'
  return /^[a-z0-9]{1,8}$/i.test(raw) ? raw.toLowerCase() : 'bin'
}
