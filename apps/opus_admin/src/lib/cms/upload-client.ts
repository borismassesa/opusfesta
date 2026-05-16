'use client'

import { createCmsMediaUploadUrl } from './upload-media'

export type UploadedMedia = { url: string; type: 'image' | 'video' }

// Mint a signed Storage URL on the server, then PUT the file straight to
// Supabase. See upload-media.ts for the why (Vercel body cap).
export async function uploadCmsMedia(
  file: File,
  pathPrefix: string,
  kind: 'image' | 'video' | 'media',
): Promise<UploadedMedia> {
  const minted = await createCmsMediaUploadUrl({
    pathPrefix,
    filename: file.name,
    mimeType: file.type,
    sizeBytes: file.size,
    kind,
  })
  if (!minted.ok) throw new Error(minted.error)

  const put = await fetch(minted.uploadUrl, {
    method: 'PUT',
    headers: { 'Content-Type': file.type, 'x-upsert': 'false' },
    body: file,
  })
  if (!put.ok) {
    const body = await put.text().catch(() => '')
    throw new Error(
      `Storage rejected upload (${put.status}${body ? `: ${body.slice(0, 120)}` : ''})`,
    )
  }
  return { url: minted.publicUrl, type: minted.mediaType }
}
