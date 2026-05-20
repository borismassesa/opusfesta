import { createSupabaseAdminClient } from '@/lib/supabase'
import {
  OPUS_PASS_INVITATIONS_FEATURED_SUITE_FALLBACK,
  type OpusPassInvitationsFeaturedSuiteContent,
  type OpusPassInvitationsFeaturedSuiteRow,
} from '@/lib/cms/opus-pass-invitations-featured-suite'
import FeaturedSuiteEditor from './FeaturedSuiteEditor'

export const dynamic = 'force-dynamic'

export default async function OpusPassInvitationsFeaturedSuiteEditorPage() {
  const supabase = createSupabaseAdminClient()
  const { data: row } = await supabase
    .from('website_page_sections')
    .select('*')
    .eq('page_key', 'opus-pass-invitations')
    .eq('section_key', 'featured-suite')
    .maybeSingle<OpusPassInvitationsFeaturedSuiteRow>()
  const stored = (row?.draft_content ?? row?.content) as
    | Partial<OpusPassInvitationsFeaturedSuiteContent>
    | null
  const initial: OpusPassInvitationsFeaturedSuiteContent = stored
    ? {
        ...OPUS_PASS_INVITATIONS_FEATURED_SUITE_FALLBACK,
        ...stored,
        trust_strip:
          stored.trust_strip && Array.isArray(stored.trust_strip) && stored.trust_strip.length > 0
            ? stored.trust_strip
            : OPUS_PASS_INVITATIONS_FEATURED_SUITE_FALLBACK.trust_strip,
      }
    : OPUS_PASS_INVITATIONS_FEATURED_SUITE_FALLBACK
  const hasDraft = !!row?.draft_content
  return <FeaturedSuiteEditor initial={initial} hasDraft={hasDraft} />
}
