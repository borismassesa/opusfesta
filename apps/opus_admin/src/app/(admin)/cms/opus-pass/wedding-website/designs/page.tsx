import { createSupabaseAdminClient } from '@/lib/supabase'
import {
  OPUS_PASS_WEBSITES_DESIGNS_FALLBACK,
  type OpusPassWebsitesDesignsContent,
  type OpusPassWebsitesDesignsRow,
} from '@/lib/cms/opus-pass-websites-designs'
import DesignsEditor from './DesignsEditor'

export const dynamic = 'force-dynamic'

export default async function OpusPassWebsitesDesignsEditorPage() {
  const supabase = createSupabaseAdminClient()
  const { data: row } = await supabase
    .from('website_page_sections')
    .select('*')
    .eq('page_key', 'opus-pass-websites')
    .eq('section_key', 'designs')
    .maybeSingle<OpusPassWebsitesDesignsRow>()
  const stored = (row?.draft_content ?? row?.content) as
    | Partial<OpusPassWebsitesDesignsContent>
    | null
  const initial: OpusPassWebsitesDesignsContent = {
    heading: stored?.heading ?? OPUS_PASS_WEBSITES_DESIGNS_FALLBACK.heading,
    tabs:
      stored?.tabs && Array.isArray(stored.tabs) && stored.tabs.length > 0
        ? stored.tabs
        : OPUS_PASS_WEBSITES_DESIGNS_FALLBACK.tabs,
    designs:
      stored?.designs && Array.isArray(stored.designs) && stored.designs.length > 0
        ? stored.designs
        : OPUS_PASS_WEBSITES_DESIGNS_FALLBACK.designs,
  }
  const hasDraft = !!row?.draft_content
  return <DesignsEditor initial={initial} hasDraft={hasDraft} />
}
