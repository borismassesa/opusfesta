import { createSupabaseAdminClient } from '@/lib/supabase'
import {
  OPUS_PASS_GUESTS_SPREAD_FALLBACK,
  type OpusPassGuestsSpreadContent,
  type OpusPassGuestsSpreadRow,
} from '@/lib/cms/opus-pass-guests-spread-the-joy'
import SpreadEditor from './SpreadEditor'

export const dynamic = 'force-dynamic'

export default async function OpusPassGuestsSpreadEditorPage() {
  const supabase = createSupabaseAdminClient()
  const { data: row } = await supabase
    .from('website_page_sections')
    .select('*')
    .eq('page_key', 'opus-pass-guests')
    .eq('section_key', 'spread-the-joy')
    .maybeSingle<OpusPassGuestsSpreadRow>()
  const stored = (row?.draft_content ?? row?.content) as
    | Partial<OpusPassGuestsSpreadContent>
    | null
  const initial: OpusPassGuestsSpreadContent = stored
    ? {
        heading: stored.heading ?? OPUS_PASS_GUESTS_SPREAD_FALLBACK.heading,
        description: stored.description ?? OPUS_PASS_GUESTS_SPREAD_FALLBACK.description,
        items:
          stored.items && Array.isArray(stored.items) && stored.items.length > 0
            ? stored.items
            : OPUS_PASS_GUESTS_SPREAD_FALLBACK.items,
      }
    : OPUS_PASS_GUESTS_SPREAD_FALLBACK
  const hasDraft = !!row?.draft_content
  return <SpreadEditor initial={initial} hasDraft={hasDraft} />
}
