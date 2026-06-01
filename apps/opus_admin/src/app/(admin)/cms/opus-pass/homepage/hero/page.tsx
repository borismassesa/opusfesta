import { createSupabaseAdminClient } from '@/lib/supabase'
import {
  OPUS_PASS_HERO_FALLBACK,
  type OpusPassHeroContent,
  type OpusPassHeroRow,
} from '@/lib/cms/opus-pass-hero'
import HeroEditor from './HeroEditor'

export const dynamic = 'force-dynamic'

export default async function OpusPassHeroEditorPage() {
  const supabase = createSupabaseAdminClient()
  const { data: row } = await supabase
    .from('website_page_sections')
    .select('*')
    .eq('page_key', 'opus-pass-homepage')
    .eq('section_key', 'hero')
    .maybeSingle<OpusPassHeroRow>()
  const stored = (row?.draft_content ?? row?.content) as Partial<OpusPassHeroContent> | null
  const initial: OpusPassHeroContent = stored
    ? {
        ...OPUS_PASS_HERO_FALLBACK,
        ...stored,
        avatars:
          stored.avatars && Array.isArray(stored.avatars) && stored.avatars.length > 0
            ? stored.avatars
            : OPUS_PASS_HERO_FALLBACK.avatars,
        featured_in:
          stored.featured_in && Array.isArray(stored.featured_in) && stored.featured_in.length > 0
            ? stored.featured_in
            : OPUS_PASS_HERO_FALLBACK.featured_in,
      }
    : OPUS_PASS_HERO_FALLBACK
  const hasDraft = !!row?.draft_content
  return <HeroEditor initial={initial} hasDraft={hasDraft} />
}
