import { createSupabaseAdminClient } from '@/lib/supabase'
import {
  OPUS_PASS_INVITATIONS_FEATURES_FALLBACK,
  type OpusPassInvitationsFeaturesContent,
  type OpusPassInvitationsFeaturesRow,
} from '@/lib/cms/opus-pass-invitations-features'
import FeaturesEditor from './FeaturesEditor'

export const dynamic = 'force-dynamic'

export default async function OpusPassInvitationsFeaturesEditorPage() {
  const supabase = createSupabaseAdminClient()
  const { data: row } = await supabase
    .from('website_page_sections')
    .select('*')
    .eq('page_key', 'opus-pass-invitations')
    .eq('section_key', 'features')
    .maybeSingle<OpusPassInvitationsFeaturesRow>()
  const stored = (row?.draft_content ?? row?.content) as
    | Partial<OpusPassInvitationsFeaturesContent>
    | null
  const initial: OpusPassInvitationsFeaturesContent = stored
    ? {
        heading: stored.heading ?? OPUS_PASS_INVITATIONS_FEATURES_FALLBACK.heading,
        cards:
          stored.cards && Array.isArray(stored.cards) && stored.cards.length > 0
            ? stored.cards
            : OPUS_PASS_INVITATIONS_FEATURES_FALLBACK.cards,
      }
    : OPUS_PASS_INVITATIONS_FEATURES_FALLBACK
  const hasDraft = !!row?.draft_content
  return <FeaturesEditor initial={initial} hasDraft={hasDraft} />
}
