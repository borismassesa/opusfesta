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
  // Map fields explicitly (not a blind spread) so legacy keys from the old
  // two-card hero (main_image_url, card_*) on un-migrated rows don't ride back
  // into the draft and get re-persisted on the next save.
  const F = OPUS_PASS_HERO_FALLBACK
  const initial: OpusPassHeroContent = stored
    ? {
        headline_line_1: stored.headline_line_1 ?? F.headline_line_1,
        headline_line_2: stored.headline_line_2 ?? F.headline_line_2,
        description: stored.description ?? F.description,
        primary_cta_label: stored.primary_cta_label ?? F.primary_cta_label,
        primary_cta_href: stored.primary_cta_href ?? F.primary_cta_href,
        secondary_cta_label: stored.secondary_cta_label ?? F.secondary_cta_label,
        secondary_cta_href: stored.secondary_cta_href ?? F.secondary_cta_href,
        trust_count: stored.trust_count ?? F.trust_count,
        rating: stored.rating ?? F.rating,
        avatars:
          stored.avatars && Array.isArray(stored.avatars) && stored.avatars.length > 0
            ? stored.avatars
            : F.avatars,
        featured_in:
          stored.featured_in && Array.isArray(stored.featured_in) && stored.featured_in.length > 0
            ? stored.featured_in
            : F.featured_in,
        featured_in_label: stored.featured_in_label ?? F.featured_in_label,
      }
    : OPUS_PASS_HERO_FALLBACK
  const hasDraft = !!row?.draft_content
  return <HeroEditor initial={initial} hasDraft={hasDraft} />
}
