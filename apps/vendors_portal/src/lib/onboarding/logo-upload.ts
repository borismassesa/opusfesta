'use server'

import { auth } from '@clerk/nextjs/server'
import { createSupabaseAdminClient } from '@/lib/supabase'

// Logo upload during ONBOARDING — before a vendor row exists. The storefront
// uploader (uploadStorefrontPhoto) gates on ensureLiveVendor(), which a vendor
// mid-application doesn't satisfy, so onboarding needs its own path. We gate on
// the authenticated Clerk user and write to a user-scoped folder; submit then
// copies the resulting URL onto vendors.logo. Uses the service-role client so
// the write doesn't depend on storage RLS folder conventions.

export type OnboardingLogoResult =
  | { ok: true; url: string }
  | { ok: false; error: string }

const ALLOWED_MIME = new Set(['image/jpeg', 'image/png', 'image/webp'])
const MAX_BYTES = 10 * 1024 * 1024 // logos are small; 10 MB is generous

const EXT_BY_MIME: Record<string, string> = {
  'image/jpeg': 'jpg',
  'image/png': 'png',
  'image/webp': 'webp',
}

export async function uploadOnboardingLogo(
  formData: FormData,
): Promise<OnboardingLogoResult> {
  const { userId } = await auth()
  if (!userId) return { ok: false, error: 'Sign in to upload a logo.' }

  const file = formData.get('file')
  if (!(file instanceof File)) {
    return { ok: false, error: 'No file in upload payload.' }
  }
  if (!ALLOWED_MIME.has(file.type)) {
    return { ok: false, error: 'Only JPEG, PNG, or WebP images are allowed.' }
  }
  if (file.size === 0) return { ok: false, error: 'That file is empty.' }
  if (file.size > MAX_BYTES) {
    return { ok: false, error: 'Logo is over the 10 MB limit.' }
  }

  const ext = EXT_BY_MIME[file.type] ?? 'bin'
  const path = `onboarding/${userId}/logo-${Date.now()}.${ext}`

  const admin = createSupabaseAdminClient()
  const buf = Buffer.from(await file.arrayBuffer())
  const upload = await admin.storage
    .from('vendor-portfolios')
    .upload(path, buf, { contentType: file.type, upsert: false })
  if (upload.error) {
    return { ok: false, error: `Upload failed: ${upload.error.message}` }
  }
  const publicUrl = admin.storage.from('vendor-portfolios').getPublicUrl(path)
  return { ok: true, url: publicUrl.data.publicUrl }
}
