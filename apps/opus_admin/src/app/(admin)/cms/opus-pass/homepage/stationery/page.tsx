import { createSupabaseAdminClient } from '@/lib/supabase'
import {
  OPUS_PASS_STATIONERY_FALLBACK,
  type OpusPassStationeryContent,
  type OpusPassStationeryRow,
} from '@/lib/cms/opus-pass-stationery'
import StationeryEditor from './StationeryEditor'

export const dynamic = 'force-dynamic'

export default async function OpusPassStationeryEditorPage() {
  const supabase = createSupabaseAdminClient()
  const { data: row } = await supabase
    .from('website_page_sections')
    .select('*')
    .eq('page_key', 'opus-pass-homepage')
    .eq('section_key', 'stationery')
    .maybeSingle<OpusPassStationeryRow>()
  const stored = (row?.draft_content ?? row?.content) as Partial<OpusPassStationeryContent> | null
  const initial: OpusPassStationeryContent = stored
    ? {
        heading: stored.heading ?? OPUS_PASS_STATIONERY_FALLBACK.heading,
        swatches:
          stored.swatches && Array.isArray(stored.swatches) && stored.swatches.length > 0
            ? stored.swatches
            : OPUS_PASS_STATIONERY_FALLBACK.swatches,
        cards:
          stored.cards && Array.isArray(stored.cards) && stored.cards.length > 0
            ? stored.cards
            : OPUS_PASS_STATIONERY_FALLBACK.cards,
      }
    : OPUS_PASS_STATIONERY_FALLBACK
  const hasDraft = !!row?.draft_content
  return <StationeryEditor initial={initial} hasDraft={hasDraft} />
}
