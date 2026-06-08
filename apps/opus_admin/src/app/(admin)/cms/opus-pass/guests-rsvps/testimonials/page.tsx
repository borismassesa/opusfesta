import { createSupabaseAdminClient } from '@/lib/supabase'
import {
  OPUS_PASS_GUESTS_TESTIMONIALS_FALLBACK,
  type OpusPassGuestsTestimonialsContent,
  type OpusPassGuestsTestimonialsRow,
} from '@/lib/cms/opus-pass-guests-testimonials'
import TestimonialsEditor from './TestimonialsEditor'

export const dynamic = 'force-dynamic'

export default async function OpusPassGuestsTestimonialsEditorPage() {
  const supabase = createSupabaseAdminClient()
  const { data: row } = await supabase
    .from('website_page_sections')
    .select('*')
    .eq('page_key', 'opus-pass-guests')
    .eq('section_key', 'testimonials')
    .maybeSingle<OpusPassGuestsTestimonialsRow>()
  const stored = (row?.draft_content ?? row?.content) as
    | Partial<OpusPassGuestsTestimonialsContent>
    | null
  const initial: OpusPassGuestsTestimonialsContent = stored
    ? {
        headline: stored.headline ?? OPUS_PASS_GUESTS_TESTIMONIALS_FALLBACK.headline,
        description: stored.description ?? OPUS_PASS_GUESTS_TESTIMONIALS_FALLBACK.description,
        cta_label: stored.cta_label ?? OPUS_PASS_GUESTS_TESTIMONIALS_FALLBACK.cta_label,
        cta_href: stored.cta_href ?? OPUS_PASS_GUESTS_TESTIMONIALS_FALLBACK.cta_href,
        column1:
          stored.column1 && Array.isArray(stored.column1) && stored.column1.length > 0
            ? stored.column1
            : OPUS_PASS_GUESTS_TESTIMONIALS_FALLBACK.column1,
        column2:
          stored.column2 && Array.isArray(stored.column2) && stored.column2.length > 0
            ? stored.column2
            : OPUS_PASS_GUESTS_TESTIMONIALS_FALLBACK.column2,
      }
    : OPUS_PASS_GUESTS_TESTIMONIALS_FALLBACK
  const hasDraft = !!row?.draft_content
  return <TestimonialsEditor initial={initial} hasDraft={hasDraft} />
}
