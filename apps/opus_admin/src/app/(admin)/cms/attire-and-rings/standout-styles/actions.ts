'use server'

import { revalidatePath } from 'next/cache'
import { revalidateWebsite } from '@/lib/revalidate'
import { createSupabaseAdminClient } from '@/lib/supabase'
import type { AttireStandoutStylesContent } from '@/lib/cms/attire-standout-styles'

const PAGE_KEY = 'attire-and-rings'
const SECTION_KEY = 'standout-styles'

export async function saveAttireStandoutStylesDraft(draft: AttireStandoutStylesContent): Promise<void> {
  const supabase = createSupabaseAdminClient()
  const { error } = await supabase
    .from('website_page_sections')
    .upsert(
      { page_key: PAGE_KEY, section_key: SECTION_KEY, draft_content: draft, content: draft },
      { onConflict: 'page_key,section_key', ignoreDuplicates: false }
    )
  if (error) throw error
  revalidatePath('/cms/attire-and-rings/standout-styles')
}

export async function publishAttireStandoutStyles(): Promise<void> {
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

  revalidatePath('/cms/attire-and-rings/standout-styles')
  await revalidateWebsite('/attire-and-rings')
}

export async function discardAttireStandoutStylesDraft(): Promise<void> {
  const supabase = createSupabaseAdminClient()
  const { error } = await supabase
    .from('website_page_sections')
    .update({ draft_content: null })
    .eq('page_key', PAGE_KEY)
    .eq('section_key', SECTION_KEY)
  if (error) throw error
  revalidatePath('/cms/attire-and-rings/standout-styles')
}
