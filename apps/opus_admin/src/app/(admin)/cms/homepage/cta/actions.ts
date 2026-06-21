'use server'

import { revalidatePath } from 'next/cache'
import { revalidateWebsite } from '@/lib/revalidate'
import { createSupabaseAdminClient } from '@/lib/supabase'
import { requirePermission } from '@/lib/admin-auth'
import type { CtaContent } from '@/lib/cms/cta'

const PAGE_KEY = 'home'
const SECTION_KEY = 'cta'

export async function saveCtaDraft(draft: CtaContent): Promise<void> {
  await requirePermission('cms.write')
  const supabase = createSupabaseAdminClient()
  const { error } = await supabase
    .from('website_page_sections')
    .upsert(
      { page_key: PAGE_KEY, section_key: SECTION_KEY, draft_content: draft },
      { onConflict: 'page_key,section_key' }
    )
  if (error) throw error
  revalidatePath('/cms/homepage/cta')
}

export async function publishCta(): Promise<void> {
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

  revalidatePath('/cms/homepage/cta')
  await revalidateWebsite()
}

export async function discardCtaDraft(): Promise<void> {
  await requirePermission('cms.write')
  const supabase = createSupabaseAdminClient()
  const { error } = await supabase
    .from('website_page_sections')
    .update({ draft_content: null })
    .eq('page_key', PAGE_KEY)
    .eq('section_key', SECTION_KEY)
  if (error) throw error
  revalidatePath('/cms/homepage/cta')
}

