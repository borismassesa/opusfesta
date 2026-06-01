import { createSupabaseAdminClient } from '@/lib/supabase'
import {
  OPUS_PASS_GUESTS_HERO_FALLBACK,
  type OpusPassGuestsHeroContent,
  type OpusPassGuestsHeroRow,
} from '@/lib/cms/opus-pass-guests-hero'
import HeroEditor from './HeroEditor'

export const dynamic = 'force-dynamic'

export default async function OpusPassGuestsHeroEditorPage() {
  const supabase = createSupabaseAdminClient()
  const { data: row } = await supabase
    .from('website_page_sections')
    .select('*')
    .eq('page_key', 'opus-pass-guests')
    .eq('section_key', 'hero')
    .maybeSingle<OpusPassGuestsHeroRow>()
  const stored = (row?.draft_content ?? row?.content) as
    | Partial<OpusPassGuestsHeroContent>
    | null
  const initial: OpusPassGuestsHeroContent = stored
    ? {
        ...OPUS_PASS_GUESTS_HERO_FALLBACK,
        ...stored,
        avatars:
          stored.avatars && Array.isArray(stored.avatars) && stored.avatars.length > 0
            ? stored.avatars
            : OPUS_PASS_GUESTS_HERO_FALLBACK.avatars,
        collage:
          stored.collage && Array.isArray(stored.collage) && stored.collage.length > 0
            ? stored.collage
            : OPUS_PASS_GUESTS_HERO_FALLBACK.collage,
      }
    : OPUS_PASS_GUESTS_HERO_FALLBACK
  const hasDraft = !!row?.draft_content
  return <HeroEditor initial={initial} hasDraft={hasDraft} />
}
