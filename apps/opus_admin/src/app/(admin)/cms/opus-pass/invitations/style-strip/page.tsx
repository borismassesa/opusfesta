import { createSupabaseAdminClient } from '@/lib/supabase'
import {
  OPUS_PASS_INVITATIONS_STYLE_STRIP_FALLBACK,
  type OpusPassInvitationsStyleStripContent,
  type OpusPassInvitationsStyleStripRow,
} from '@/lib/cms/opus-pass-invitations-style-strip'
import StyleStripEditor from './StyleStripEditor'

export const dynamic = 'force-dynamic'

export default async function OpusPassInvitationsStyleStripEditorPage() {
  const supabase = createSupabaseAdminClient()
  const { data: row } = await supabase
    .from('website_page_sections')
    .select('*')
    .eq('page_key', 'opus-pass-invitations')
    .eq('section_key', 'style-strip')
    .maybeSingle<OpusPassInvitationsStyleStripRow>()
  const stored = (row?.draft_content ?? row?.content) as
    | Partial<OpusPassInvitationsStyleStripContent>
    | null
  const initial: OpusPassInvitationsStyleStripContent =
    stored?.items && Array.isArray(stored.items) && stored.items.length > 0
      ? { items: stored.items }
      : OPUS_PASS_INVITATIONS_STYLE_STRIP_FALLBACK
  const hasDraft = !!row?.draft_content
  return <StyleStripEditor initial={initial} hasDraft={hasDraft} />
}
