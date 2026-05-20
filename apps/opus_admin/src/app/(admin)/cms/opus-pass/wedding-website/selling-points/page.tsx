import { createSupabaseAdminClient } from '@/lib/supabase'
import {
  OPUS_PASS_WEBSITES_SELLING_POINTS_FALLBACK,
  type OpusPassWebsitesSellingPointsContent,
  type OpusPassWebsitesSellingPointsRow,
} from '@/lib/cms/opus-pass-websites-selling-points'
import SellingPointsEditor from './SellingPointsEditor'

export const dynamic = 'force-dynamic'

export default async function OpusPassWebsitesSellingPointsEditorPage() {
  const supabase = createSupabaseAdminClient()
  const { data: row } = await supabase
    .from('website_page_sections')
    .select('*')
    .eq('page_key', 'opus-pass-websites')
    .eq('section_key', 'selling-points')
    .maybeSingle<OpusPassWebsitesSellingPointsRow>()
  const stored = (row?.draft_content ?? row?.content) as
    | Partial<OpusPassWebsitesSellingPointsContent>
    | null
  const initial: OpusPassWebsitesSellingPointsContent = {
    heading: stored?.heading ?? OPUS_PASS_WEBSITES_SELLING_POINTS_FALLBACK.heading,
    description: stored?.description ?? OPUS_PASS_WEBSITES_SELLING_POINTS_FALLBACK.description,
    items:
      stored?.items && Array.isArray(stored.items) && stored.items.length > 0
        ? stored.items
        : OPUS_PASS_WEBSITES_SELLING_POINTS_FALLBACK.items,
  }
  const hasDraft = !!row?.draft_content
  return <SellingPointsEditor initial={initial} hasDraft={hasDraft} />
}
