import { createSupabaseAdminClient } from '@/lib/supabase'
import {
  OPUS_PASS_WEBSITES_TESTIMONIALS_FALLBACK,
  type OpusPassWebsitesTestimonialsContent,
  type OpusPassWebsitesTestimonialsRow,
} from '@/lib/cms/opus-pass-websites-testimonials'
import TestimonialsEditor from './TestimonialsEditor'

export const dynamic = 'force-dynamic'

export default async function OpusPassWebsitesTestimonialsEditorPage() {
  const supabase = createSupabaseAdminClient()
  const { data: row } = await supabase
    .from('website_page_sections')
    .select('*')
    .eq('page_key', 'opus-pass-websites')
    .eq('section_key', 'testimonials')
    .maybeSingle<OpusPassWebsitesTestimonialsRow>()
  const stored = (row?.draft_content ?? row?.content) as
    | Partial<OpusPassWebsitesTestimonialsContent>
    | null
  const initial: OpusPassWebsitesTestimonialsContent = {
    heading: stored?.heading ?? OPUS_PASS_WEBSITES_TESTIMONIALS_FALLBACK.heading,
    items:
      stored?.items && Array.isArray(stored.items) && stored.items.length > 0
        ? stored.items
        : OPUS_PASS_WEBSITES_TESTIMONIALS_FALLBACK.items,
  }
  const hasDraft = !!row?.draft_content
  return <TestimonialsEditor initial={initial} hasDraft={hasDraft} />
}
