import { createSupabaseAdminClient } from '@/lib/supabase'
import {
  OPUS_PASS_WEBSITES_FAQS_FALLBACK,
  type OpusPassWebsitesFaqsContent,
  type OpusPassWebsitesFaqsRow,
} from '@/lib/cms/opus-pass-websites-faqs'
import FaqsEditor from './FaqsEditor'

export const dynamic = 'force-dynamic'

export default async function OpusPassWebsitesFaqsEditorPage() {
  const supabase = createSupabaseAdminClient()
  const { data: row } = await supabase
    .from('website_page_sections')
    .select('*')
    .eq('page_key', 'opus-pass-websites')
    .eq('section_key', 'faqs')
    .maybeSingle<OpusPassWebsitesFaqsRow>()
  const stored = (row?.draft_content ?? row?.content) as
    | Partial<OpusPassWebsitesFaqsContent>
    | null
  const initial: OpusPassWebsitesFaqsContent = {
    heading: stored?.heading ?? OPUS_PASS_WEBSITES_FAQS_FALLBACK.heading,
    description: stored?.description ?? OPUS_PASS_WEBSITES_FAQS_FALLBACK.description,
    items:
      stored?.items && Array.isArray(stored.items) && stored.items.length > 0
        ? stored.items
        : OPUS_PASS_WEBSITES_FAQS_FALLBACK.items,
  }
  const hasDraft = !!row?.draft_content
  return <FaqsEditor initial={initial} hasDraft={hasDraft} />
}
