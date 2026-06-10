'use server'

import { createSupabaseAdminClient } from '@/lib/supabase'

const PAGE_KEY = 'opus-pass-homepage'

/** Section keys on this page that currently have an unpublished draft. */
export async function getSectionDraftFlags(): Promise<string[]> {
  const supabase = createSupabaseAdminClient()
  const { data } = await supabase
    .from('website_page_sections')
    .select('section_key')
    .eq('page_key', PAGE_KEY)
    .not('draft_content', 'is', null)
  return (data ?? []).map((row) => row.section_key as string)
}
