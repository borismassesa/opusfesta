import { createSupabaseAdminClient } from '@/lib/supabase'
import {
  OPUS_PASS_INFO_FALLBACK,
  type OpusPassInfoContent,
  type OpusPassInfoRow,
} from '@/lib/cms/opus-pass-info'
import InfoEditor from './InfoEditor'

export const dynamic = 'force-dynamic'

export default async function OpusPassInfoEditorPage() {
  const supabase = createSupabaseAdminClient()
  const { data: row } = await supabase
    .from('website_page_sections')
    .select('*')
    .eq('page_key', 'opus-pass-homepage')
    .eq('section_key', 'info')
    .maybeSingle<OpusPassInfoRow>()
  const stored = (row?.draft_content ?? row?.content) as Partial<OpusPassInfoContent> | null
  const initial: OpusPassInfoContent = stored
    ? {
        title: stored.title ?? OPUS_PASS_INFO_FALLBACK.title,
        lead: stored.lead ?? OPUS_PASS_INFO_FALLBACK.lead,
        paragraphs:
          stored.paragraphs && Array.isArray(stored.paragraphs) && stored.paragraphs.length > 0
            ? stored.paragraphs
            : OPUS_PASS_INFO_FALLBACK.paragraphs,
        closing_heading: stored.closing_heading ?? OPUS_PASS_INFO_FALLBACK.closing_heading,
        cta_label: stored.cta_label ?? OPUS_PASS_INFO_FALLBACK.cta_label,
        cta_href: stored.cta_href ?? OPUS_PASS_INFO_FALLBACK.cta_href,
      }
    : OPUS_PASS_INFO_FALLBACK
  const hasDraft = !!row?.draft_content
  return <InfoEditor initial={initial} hasDraft={hasDraft} />
}
