'use server'

import { revalidatePath } from 'next/cache'
import { createSupabaseAdminClient } from '@/lib/supabase'
import type { PricingComparisonContent } from '@/lib/cms/pricing-comparison'

const PAGE_KEY = 'home'
const SECTION_KEY = 'pricing-comparison'

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
    // Best-effort.
  }
}

export async function savePricingComparisonDraft(
  draft: PricingComparisonContent
): Promise<void> {
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
  revalidatePath('/cms/homepage/pricing-comparison')
}

export async function publishPricingComparison(): Promise<void> {
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

  revalidatePath('/cms/homepage/pricing-comparison')
  await revalidateWebsite()
}

export async function discardPricingComparisonDraft(): Promise<void> {
  const supabase = createSupabaseAdminClient()
  const { error } = await supabase
    .from('website_page_sections')
    .update({ draft_content: null })
    .eq('page_key', PAGE_KEY)
    .eq('section_key', SECTION_KEY)
  if (error) throw error
  revalidatePath('/cms/homepage/pricing-comparison')
}

export async function uploadPricingMedia(
  formData: FormData
): Promise<{ url: string }> {
  const file = formData.get('file') as File | null
  if (!file) throw new Error('No file provided')

  const supabase = createSupabaseAdminClient()
  const ext = file.name.split('.').pop() ?? 'bin'
  const path = `homepage/pricing-comparison/${Date.now()}-${crypto.randomUUID()}.${ext}`

  const { error: uploadErr } = await supabase.storage
    .from('website-media')
    .upload(path, file, { contentType: file.type, upsert: false })
  if (uploadErr) throw uploadErr

  const { data } = supabase.storage.from('website-media').getPublicUrl(path)
  return { url: data.publicUrl }
}
