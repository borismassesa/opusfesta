import { createSupabaseAdminClient } from '@/lib/supabase'
import {
  OPUS_PASS_WEBSITES_HERO_FALLBACK,
  type OpusPassWebsitesHeroContent,
  type OpusPassWebsitesHeroRow,
} from '@/lib/cms/opus-pass-websites-hero'
import HeroEditor from './HeroEditor'

export const dynamic = 'force-dynamic'

export default async function OpusPassWebsitesHeroEditorPage() {
  const supabase = createSupabaseAdminClient()
  const { data: row } = await supabase
    .from('website_page_sections')
    .select('*')
    .eq('page_key', 'opus-pass-websites')
    .eq('section_key', 'hero')
    .maybeSingle<OpusPassWebsitesHeroRow>()
  const stored = (row?.draft_content ?? row?.content) as
    | Partial<OpusPassWebsitesHeroContent>
    | null
  const initial: OpusPassWebsitesHeroContent = stored
    ? { ...OPUS_PASS_WEBSITES_HERO_FALLBACK, ...stored }
    : OPUS_PASS_WEBSITES_HERO_FALLBACK
  const hasDraft = !!row?.draft_content
  return <HeroEditor initial={initial} hasDraft={hasDraft} />
}
