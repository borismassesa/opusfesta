import { createSupabaseAdminClient } from '@/lib/supabase'
import {
  OPUS_PASS_GUESTS_FEATURES_FALLBACK,
  type OpusPassGuestsFeaturesContent,
  type OpusPassGuestsFeaturesRow,
} from '@/lib/cms/opus-pass-guests-features'
import FeaturesEditor from './FeaturesEditor'

export const dynamic = 'force-dynamic'

export default async function OpusPassGuestsFeaturesEditorPage() {
  const supabase = createSupabaseAdminClient()
  const { data: row } = await supabase
    .from('website_page_sections')
    .select('*')
    .eq('page_key', 'opus-pass-guests')
    .eq('section_key', 'features')
    .maybeSingle<OpusPassGuestsFeaturesRow>()
  const stored = (row?.draft_content ?? row?.content) as
    | Partial<OpusPassGuestsFeaturesContent>
    | null
  const initial: OpusPassGuestsFeaturesContent = stored
    ? {
        heading: stored.heading ?? OPUS_PASS_GUESTS_FEATURES_FALLBACK.heading,
        description: stored.description ?? OPUS_PASS_GUESTS_FEATURES_FALLBACK.description,
        cards:
          stored.cards && Array.isArray(stored.cards) && stored.cards.length > 0
            ? stored.cards
            : OPUS_PASS_GUESTS_FEATURES_FALLBACK.cards,
      }
    : OPUS_PASS_GUESTS_FEATURES_FALLBACK
  const hasDraft = !!row?.draft_content
  return <FeaturesEditor initial={initial} hasDraft={hasDraft} />
}
