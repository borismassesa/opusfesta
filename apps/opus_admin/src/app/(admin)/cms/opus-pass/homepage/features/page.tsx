import { createSupabaseAdminClient } from '@/lib/supabase'
import {
  OPUS_PASS_FEATURES_FALLBACK,
  type OpusPassFeaturesContent,
  type OpusPassFeaturesRow,
} from '@/lib/cms/opus-pass-features'
import FeaturesEditor from './FeaturesEditor'

export const dynamic = 'force-dynamic'

export default async function OpusPassFeaturesEditorPage() {
  const supabase = createSupabaseAdminClient()
  const { data: row } = await supabase
    .from('website_page_sections')
    .select('*')
    .eq('page_key', 'opus-pass-homepage')
    .eq('section_key', 'features')
    .maybeSingle<OpusPassFeaturesRow>()
  const stored = (row?.draft_content ?? row?.content) as Partial<OpusPassFeaturesContent> | null
  const initial: OpusPassFeaturesContent = stored
    ? {
        header_title: stored.header_title ?? OPUS_PASS_FEATURES_FALLBACK.header_title,
        header_description:
          stored.header_description ?? OPUS_PASS_FEATURES_FALLBACK.header_description,
        blocks:
          stored.blocks && Array.isArray(stored.blocks) && stored.blocks.length > 0
            ? stored.blocks
            : OPUS_PASS_FEATURES_FALLBACK.blocks,
      }
    : OPUS_PASS_FEATURES_FALLBACK
  const hasDraft = !!row?.draft_content
  return <FeaturesEditor initial={initial} hasDraft={hasDraft} />
}
