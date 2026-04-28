import { createSupabaseAdminClient } from '@/lib/supabase'
import {
  FEATURES_FALLBACK,
  type FeaturesContent,
  type FeaturesRow,
} from '@/lib/cms/features'
import FeaturesEditor from './FeaturesEditor'

export const dynamic = 'force-dynamic'

export default async function FeaturesEditorPage() {
  const supabase = createSupabaseAdminClient()
  const { data: row } = await supabase
    .from('website_page_sections')
    .select('*')
    .eq('page_key', 'home')
    .eq('section_key', 'features')
    .maybeSingle<FeaturesRow>()
  const stored = (row?.draft_content ?? row?.content) as Partial<FeaturesContent> | null
  const initial: FeaturesContent = stored
    ? {
        ...FEATURES_FALLBACK,
        ...stored,
        blocks:
          Array.isArray(stored.blocks) && stored.blocks.length > 0
            ? stored.blocks
            : FEATURES_FALLBACK.blocks,
      }
    : FEATURES_FALLBACK
  const hasDraft = !!row?.draft_content
  return <FeaturesEditor initial={initial} hasDraft={hasDraft} />
}
