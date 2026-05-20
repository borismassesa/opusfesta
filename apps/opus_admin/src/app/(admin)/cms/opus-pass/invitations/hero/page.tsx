import { createSupabaseAdminClient } from '@/lib/supabase'
import {
  OPUS_PASS_INVITATIONS_HERO_FALLBACK,
  type OpusPassInvitationsHeroContent,
  type OpusPassInvitationsHeroRow,
} from '@/lib/cms/opus-pass-invitations-hero'
import HeroEditor from './HeroEditor'

export const dynamic = 'force-dynamic'

export default async function OpusPassInvitationsHeroEditorPage() {
  const supabase = createSupabaseAdminClient()
  const { data: row } = await supabase
    .from('website_page_sections')
    .select('*')
    .eq('page_key', 'opus-pass-invitations')
    .eq('section_key', 'hero')
    .maybeSingle<OpusPassInvitationsHeroRow>()
  const stored = (row?.draft_content ?? row?.content) as
    | Partial<OpusPassInvitationsHeroContent>
    | null
  const initial: OpusPassInvitationsHeroContent = stored
    ? { ...OPUS_PASS_INVITATIONS_HERO_FALLBACK, ...stored }
    : OPUS_PASS_INVITATIONS_HERO_FALLBACK
  const hasDraft = !!row?.draft_content
  return <HeroEditor initial={initial} hasDraft={hasDraft} />
}
