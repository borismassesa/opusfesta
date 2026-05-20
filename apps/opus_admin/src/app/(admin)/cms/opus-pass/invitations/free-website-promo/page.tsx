import { createSupabaseAdminClient } from '@/lib/supabase'
import {
  OPUS_PASS_INVITATIONS_FREE_WEBSITE_PROMO_FALLBACK,
  type OpusPassInvitationsFreeWebsitePromoContent,
  type OpusPassInvitationsFreeWebsitePromoRow,
} from '@/lib/cms/opus-pass-invitations-free-website-promo'
import FreeWebsitePromoEditor from './FreeWebsitePromoEditor'

export const dynamic = 'force-dynamic'

export default async function OpusPassInvitationsFreeWebsitePromoEditorPage() {
  const supabase = createSupabaseAdminClient()
  const { data: row } = await supabase
    .from('website_page_sections')
    .select('*')
    .eq('page_key', 'opus-pass-invitations')
    .eq('section_key', 'free-website-promo')
    .maybeSingle<OpusPassInvitationsFreeWebsitePromoRow>()
  const stored = (row?.draft_content ?? row?.content) as
    | Partial<OpusPassInvitationsFreeWebsitePromoContent>
    | null
  const initial: OpusPassInvitationsFreeWebsitePromoContent = stored
    ? { ...OPUS_PASS_INVITATIONS_FREE_WEBSITE_PROMO_FALLBACK, ...stored }
    : OPUS_PASS_INVITATIONS_FREE_WEBSITE_PROMO_FALLBACK
  const hasDraft = !!row?.draft_content
  return <FreeWebsitePromoEditor initial={initial} hasDraft={hasDraft} />
}
