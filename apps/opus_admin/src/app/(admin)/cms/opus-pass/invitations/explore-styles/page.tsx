import { createSupabaseAdminClient } from '@/lib/supabase'
import {
  OPUS_PASS_INVITATIONS_EXPLORE_STYLES_FALLBACK,
  type OpusPassInvitationsExploreStylesContent,
  type OpusPassInvitationsExploreStylesRow,
} from '@/lib/cms/opus-pass-invitations-explore-styles'
import ExploreStylesEditor from './ExploreStylesEditor'

export const dynamic = 'force-dynamic'

export default async function OpusPassInvitationsExploreStylesEditorPage() {
  const supabase = createSupabaseAdminClient()
  const { data: row } = await supabase
    .from('website_page_sections')
    .select('*')
    .eq('page_key', 'opus-pass-invitations')
    .eq('section_key', 'explore-styles')
    .maybeSingle<OpusPassInvitationsExploreStylesRow>()
  const stored = (row?.draft_content ?? row?.content) as
    | Partial<OpusPassInvitationsExploreStylesContent>
    | null
  const initial: OpusPassInvitationsExploreStylesContent = stored
    ? {
        heading: stored.heading ?? OPUS_PASS_INVITATIONS_EXPLORE_STYLES_FALLBACK.heading,
        columns:
          stored.columns && Array.isArray(stored.columns) && stored.columns.length > 0
            ? stored.columns
            : OPUS_PASS_INVITATIONS_EXPLORE_STYLES_FALLBACK.columns,
      }
    : OPUS_PASS_INVITATIONS_EXPLORE_STYLES_FALLBACK
  const hasDraft = !!row?.draft_content
  return <ExploreStylesEditor initial={initial} hasDraft={hasDraft} />
}
