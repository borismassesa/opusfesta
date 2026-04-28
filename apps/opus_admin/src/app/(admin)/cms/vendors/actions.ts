'use server'

import { revalidatePath } from 'next/cache'
import { createSupabaseAdminClient } from '@/lib/supabase'
import type { VendorRecord } from '@/lib/cms/vendors'

async function revalidateWebsite(): Promise<void> {
  const url = process.env.NEXT_PUBLIC_WEBSITE_URL
  const secret = process.env.WEBSITE_REVALIDATE_SECRET
  if (!url || !secret) return
  try {
    await Promise.all([
      fetch(`${url}/api/revalidate?path=/vendors`, {
        method: 'POST',
        headers: { Authorization: `Bearer ${secret}` },
      }),
      fetch(`${url}/api/revalidate?path=/`, {
        method: 'POST',
        headers: { Authorization: `Bearer ${secret}` },
      }),
    ])
  } catch {}
}

export async function upsertVendor(vendor: VendorRecord): Promise<{ id: string }> {
  const supabase = createSupabaseAdminClient()
  // Strip timestamps — DB manages them
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const { created_at, updated_at, ...body } = vendor

  const { data, error } = await supabase
    .from('website_vendors')
    .upsert(body, { onConflict: 'id' })
    .select('id')
    .single()
  if (error) throw error

  revalidatePath('/cms/vendors')
  revalidatePath(`/cms/vendors/${data.id}`)
  await revalidateWebsite()
  return { id: data.id }
}

export async function patchVendor(
  id: string,
  patch: Partial<Pick<VendorRecord, 'published' | 'featured' | 'badge'>>
): Promise<void> {
  const supabase = createSupabaseAdminClient()
  const { error } = await supabase
    .from('website_vendors')
    .update(patch)
    .eq('id', id)
  if (error) throw error

  revalidatePath('/cms/vendors')
  revalidatePath(`/cms/vendors/${id}`)
  await revalidateWebsite()
}

export async function deleteVendor(id: string): Promise<void> {
  const supabase = createSupabaseAdminClient()
  const { error } = await supabase.from('website_vendors').delete().eq('id', id)
  if (error) throw error

  revalidatePath('/cms/vendors')
  await revalidateWebsite()
}

export async function uploadVendorMedia(formData: FormData): Promise<{ url: string; type: 'image' | 'video' }> {
  const file = formData.get('file') as File | null
  const vendorId = formData.get('vendorId') as string | null
  if (!file) throw new Error('No file provided')

  const supabase = createSupabaseAdminClient()
  const ext = file.name.split('.').pop() ?? 'bin'
  const folder = vendorId ? `vendors/${vendorId}` : 'vendors/_orphan'
  const path = `${folder}/${Date.now()}-${crypto.randomUUID()}.${ext}`

  const { error: uploadErr } = await supabase.storage
    .from('website-media')
    .upload(path, file, { contentType: file.type, upsert: false })
  if (uploadErr) throw uploadErr

  const { data } = supabase.storage.from('website-media').getPublicUrl(path)
  const type: 'image' | 'video' = file.type.startsWith('video') ? 'video' : 'image'
  return { url: data.publicUrl, type }
}
