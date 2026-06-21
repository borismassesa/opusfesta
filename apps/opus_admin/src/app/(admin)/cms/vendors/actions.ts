'use server'

import { revalidatePath } from 'next/cache'
import { revalidateWebsite as revalidateWebsitePaths } from '@/lib/revalidate'
import { createSupabaseAdminClient } from '@/lib/supabase'
import { requirePermission } from '@/lib/admin-auth'
import type { VendorRecord } from '@/lib/cms/vendors'

async function revalidateWebsite(): Promise<void> {
  await revalidateWebsitePaths('/vendors', '/')
}

export async function upsertVendor(vendor: VendorRecord): Promise<{ id: string }> {
  await requirePermission('cms.write')
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
  await requirePermission('cms.write')
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
  await requirePermission('cms.write')
  const supabase = createSupabaseAdminClient()
  const { error } = await supabase.from('website_vendors').delete().eq('id', id)
  if (error) throw error

  revalidatePath('/cms/vendors')
  await revalidateWebsite()
}

