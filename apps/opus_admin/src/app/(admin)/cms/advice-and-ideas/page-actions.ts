'use server'

import { revalidatePath } from 'next/cache'
import { revalidateWebsite as revalidateWebsitePaths } from '@/lib/revalidate'
import { requireAdminRole, type AdminAccessRole } from '@/lib/admin-auth'
import { createSupabaseAdminClient } from '@/lib/supabase'
import { ADVICE_IDEAS_PAGE_KEY } from '@/lib/cms/advice-ideas'

type SectionKey = 'hero' | 'topics' | 'section_headers'
const PAGE_MANAGE_ROLES: AdminAccessRole[] = ['owner', 'admin', 'editor']

async function revalidateWebsite(): Promise<void> {
  await revalidateWebsitePaths('/advice-and-ideas')
}

export async function saveAdvicePageDraft<T extends object>(sectionKey: SectionKey, draft: T): Promise<void> {
  await requireAdminRole(PAGE_MANAGE_ROLES)
  const supabase = createSupabaseAdminClient()
  const { error } = await supabase
    .from('website_page_sections')
    .upsert(
      { page_key: ADVICE_IDEAS_PAGE_KEY, section_key: sectionKey, draft_content: draft },
      { onConflict: 'page_key,section_key' }
    )
  if (error) throw error
  revalidatePath(`/cms/advice-and-ideas/${sectionKey}`)
}

export async function publishAdvicePage(sectionKey: SectionKey): Promise<void> {
  await requireAdminRole(PAGE_MANAGE_ROLES)
  const supabase = createSupabaseAdminClient()
  const { data: row, error: loadErr } = await supabase
    .from('website_page_sections')
    .select('draft_content')
    .eq('page_key', ADVICE_IDEAS_PAGE_KEY)
    .eq('section_key', sectionKey)
    .single()
  if (loadErr) throw loadErr
  if (!row?.draft_content) return

  const { error } = await supabase
    .from('website_page_sections')
    .update({ content: row.draft_content, draft_content: null, is_published: true })
    .eq('page_key', ADVICE_IDEAS_PAGE_KEY)
    .eq('section_key', sectionKey)
  if (error) throw error

  revalidatePath(`/cms/advice-and-ideas/${sectionKey}`)
  await revalidateWebsite()
}

export async function discardAdvicePageDraft(sectionKey: SectionKey): Promise<void> {
  await requireAdminRole(PAGE_MANAGE_ROLES)
  const supabase = createSupabaseAdminClient()
  const { error } = await supabase
    .from('website_page_sections')
    .update({ draft_content: null })
    .eq('page_key', ADVICE_IDEAS_PAGE_KEY)
    .eq('section_key', sectionKey)
  if (error) throw error
  revalidatePath(`/cms/advice-and-ideas/${sectionKey}`)
}
