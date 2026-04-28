'use server'

import { revalidatePath } from 'next/cache'
import { createSupabaseAdminClient } from '@/lib/supabase'
import type { VendorSearchContent } from '@/lib/cms/vendor-search'

const PAGE_KEY = 'home'
const SECTION_KEY = 'vendor-search'

async function revalidateWebsite(): Promise<void> {
  const url = process.env.NEXT_PUBLIC_WEBSITE_URL
  const secret = process.env.WEBSITE_REVALIDATE_SECRET
  if (!url || !secret) return
  try {
    await fetch(`${url}/api/revalidate?path=/`, {
      method: 'POST',
      headers: { Authorization: `Bearer ${secret}` },
    })
  } catch {
    // Best-effort; website will pick up changes on next ISR cycle.
  }
}

export async function saveVendorSearchDraft(draft: VendorSearchContent): Promise<void> {
  const supabase = createSupabaseAdminClient()
  const { error } = await supabase
    .from('website_page_sections')
    .upsert(
      {
        page_key: PAGE_KEY,
        section_key: SECTION_KEY,
        draft_content: draft,
      },
      { onConflict: 'page_key,section_key' }
    )
  if (error) throw error
  revalidatePath('/cms/homepage/vendor-search')
}

export async function publishVendorSearch(): Promise<void> {
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

  revalidatePath('/cms/homepage/vendor-search')
  await revalidateWebsite()
}

export async function discardVendorSearchDraft(): Promise<void> {
  const supabase = createSupabaseAdminClient()
  const { error } = await supabase
    .from('website_page_sections')
    .update({ draft_content: null })
    .eq('page_key', PAGE_KEY)
    .eq('section_key', SECTION_KEY)
  if (error) throw error
  revalidatePath('/cms/homepage/vendor-search')
}
