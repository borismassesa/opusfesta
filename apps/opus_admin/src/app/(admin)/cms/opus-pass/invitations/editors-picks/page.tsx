import { createSupabaseAdminClient } from '@/lib/supabase'
import {
  OPUS_PASS_INVITATIONS_EDITORS_PICKS_FALLBACK,
  type OpusPassInvitationsEditorsPicksContent,
  type OpusPassInvitationsEditorsPicksRowSection,
} from '@/lib/cms/opus-pass-invitations-editors-picks'
import EditorsPicksEditor from './EditorsPicksEditor'

export const dynamic = 'force-dynamic'

export default async function OpusPassInvitationsEditorsPicksEditorPage() {
  const supabase = createSupabaseAdminClient()
  const { data: row } = await supabase
    .from('website_page_sections')
    .select('*')
    .eq('page_key', 'opus-pass-invitations')
    .eq('section_key', 'editors-picks')
    .maybeSingle<OpusPassInvitationsEditorsPicksRowSection>()
  const stored = (row?.draft_content ?? row?.content) as
    | Partial<OpusPassInvitationsEditorsPicksContent>
    | null
  const initial: OpusPassInvitationsEditorsPicksContent =
    stored?.rows && Array.isArray(stored.rows) && stored.rows.length > 0
      ? {
          rows: stored.rows,
          exploreLabel:
            stored.exploreLabel ?? OPUS_PASS_INVITATIONS_EDITORS_PICKS_FALLBACK.exploreLabel,
        }
      : OPUS_PASS_INVITATIONS_EDITORS_PICKS_FALLBACK
  const hasDraft = !!row?.draft_content
  return <EditorsPicksEditor initial={initial} hasDraft={hasDraft} />
}
