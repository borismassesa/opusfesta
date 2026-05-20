import { createSupabaseAdminClient } from '@/lib/supabase'
import {
  OPUS_PASS_WEBSITES_FEATURES_FALLBACK,
  type OpusPassWebsitesFeaturesContent,
  type OpusPassWebsitesFeaturesRow,
} from '@/lib/cms/opus-pass-websites-features'
import FeaturesEditor from './FeaturesEditor'

export const dynamic = 'force-dynamic'

export default async function OpusPassWebsitesFeaturesEditorPage() {
  const supabase = createSupabaseAdminClient()
  const { data: row } = await supabase
    .from('website_page_sections')
    .select('*')
    .eq('page_key', 'opus-pass-websites')
    .eq('section_key', 'features')
    .maybeSingle<OpusPassWebsitesFeaturesRow>()
  const stored = (row?.draft_content ?? row?.content) as
    | Partial<OpusPassWebsitesFeaturesContent>
    | null
  const initial: OpusPassWebsitesFeaturesContent = {
    heading: stored?.heading ?? OPUS_PASS_WEBSITES_FEATURES_FALLBACK.heading,
    description: stored?.description ?? OPUS_PASS_WEBSITES_FEATURES_FALLBACK.description,
    items:
      stored?.items && Array.isArray(stored.items) && stored.items.length > 0
        ? stored.items
        : OPUS_PASS_WEBSITES_FEATURES_FALLBACK.items,
  }
  const hasDraft = !!row?.draft_content
  return <FeaturesEditor initial={initial} hasDraft={hasDraft} />
}
