import { createSupabaseAdminClient } from '@/lib/supabase'
import {
  OPUS_PASS_INVITATIONS_FAQS_FALLBACK,
  type OpusPassInvitationsFaqsContent,
  type OpusPassInvitationsFaqsRow,
} from '@/lib/cms/opus-pass-invitations-faqs'
import FaqsEditor from './FaqsEditor'

export const dynamic = 'force-dynamic'

export default async function OpusPassInvitationsFaqsEditorPage() {
  const supabase = createSupabaseAdminClient()
  const { data: row } = await supabase
    .from('website_page_sections')
    .select('*')
    .eq('page_key', 'opus-pass-invitations')
    .eq('section_key', 'faqs')
    .maybeSingle<OpusPassInvitationsFaqsRow>()
  const stored = (row?.draft_content ?? row?.content) as
    | Partial<OpusPassInvitationsFaqsContent>
    | null
  const initial: OpusPassInvitationsFaqsContent = stored
    ? {
        heading: stored.heading ?? OPUS_PASS_INVITATIONS_FAQS_FALLBACK.heading,
        description: stored.description ?? OPUS_PASS_INVITATIONS_FAQS_FALLBACK.description,
        items:
          stored.items && Array.isArray(stored.items) && stored.items.length > 0
            ? stored.items
            : OPUS_PASS_INVITATIONS_FAQS_FALLBACK.items,
      }
    : OPUS_PASS_INVITATIONS_FAQS_FALLBACK
  const hasDraft = !!row?.draft_content
  return <FaqsEditor initial={initial} hasDraft={hasDraft} />
}
