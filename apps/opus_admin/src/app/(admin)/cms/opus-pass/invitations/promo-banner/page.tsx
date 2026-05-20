import { createSupabaseAdminClient } from '@/lib/supabase'
import {
  OPUS_PASS_INVITATIONS_PROMO_BANNER_FALLBACK,
  type OpusPassInvitationsPromoBannerContent,
  type OpusPassInvitationsPromoBannerRow,
} from '@/lib/cms/opus-pass-invitations-promo-banner'
import PromoBannerEditor from './PromoBannerEditor'

export const dynamic = 'force-dynamic'

export default async function OpusPassInvitationsPromoBannerEditorPage() {
  const supabase = createSupabaseAdminClient()
  const { data: row } = await supabase
    .from('website_page_sections')
    .select('*')
    .eq('page_key', 'opus-pass-invitations')
    .eq('section_key', 'promo-banner')
    .maybeSingle<OpusPassInvitationsPromoBannerRow>()
  const stored = (row?.draft_content ?? row?.content) as
    | Partial<OpusPassInvitationsPromoBannerContent>
    | null
  const initial: OpusPassInvitationsPromoBannerContent = stored
    ? { ...OPUS_PASS_INVITATIONS_PROMO_BANNER_FALLBACK, ...stored }
    : OPUS_PASS_INVITATIONS_PROMO_BANNER_FALLBACK
  const hasDraft = !!row?.draft_content
  return <PromoBannerEditor initial={initial} hasDraft={hasDraft} />
}
