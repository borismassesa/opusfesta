'use server'

import { revalidatePath } from 'next/cache'
import { revalidateWebsite } from '@/lib/revalidate'
import { createSupabaseAdminClient } from '@/lib/supabase'
import { requirePermission } from '@/lib/admin-auth'
import type { AttireAccessoriesContent } from '@/lib/cms/attire-accessories'

const PAGE_KEY = 'attire-and-rings'
const SECTION_KEY = 'accessories'

export async function saveAttireAccessoriesDraft(draft: AttireAccessoriesContent): Promise<void> {
  await requirePermission('cms.write')
  const supabase = createSupabaseAdminClient()
  const { error } = await supabase
    .from('website_page_sections')
    .upsert(
      { page_key: PAGE_KEY, section_key: SECTION_KEY, draft_content: draft, content: draft },
      { onConflict: 'page_key,section_key', ignoreDuplicates: false }
    )
  if (error) throw error
  revalidatePath('/cms/attire-and-rings/accessories')
}

export async function publishAttireAccessories(): Promise<void> {
  await requirePermission('cms.publish')
  const supabase = createSupabaseAdminClient()
  const { data: row, error: loadErr } = await supabase
    .from('website_page_sections')
    .select('draft_content')
    .eq('page_key', PAGE_KEY)
    .eq('section_key', SECTION_KEY)
    .single()
  if (loadErr) throw loadErr
  if (!row?.draft_content) return

  const { error } = await supabase
    .from('website_page_sections')
    .update({ content: row.draft_content, draft_content: null, is_published: true })
    .eq('page_key', PAGE_KEY)
    .eq('section_key', SECTION_KEY)
  if (error) throw error

  revalidatePath('/cms/attire-and-rings/accessories')
  await revalidateWebsite('/attire-and-rings')
}

export async function discardAttireAccessoriesDraft(): Promise<void> {
  await requirePermission('cms.write')
  const supabase = createSupabaseAdminClient()
  const { error } = await supabase
    .from('website_page_sections')
    .update({ draft_content: null })
    .eq('page_key', PAGE_KEY)
    .eq('section_key', SECTION_KEY)
  if (error) throw error
  revalidatePath('/cms/attire-and-rings/accessories')
}
