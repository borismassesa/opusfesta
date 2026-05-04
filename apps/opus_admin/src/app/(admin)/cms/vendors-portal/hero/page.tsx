import { createSupabaseAdminClient } from '@/lib/supabase'
import { HERO_FALLBACK, type HeroContent, type HeroRow } from '@/lib/cms/hero'
import HeroEditor from './HeroEditor'

export const dynamic = 'force-dynamic'

export default async function HeroEditorPage() {
  const supabase = createSupabaseAdminClient()
  const { data: row } = await supabase
    .from('website_page_sections')
    .select('*')
    .eq('page_key', 'vendors_home')
    .eq('section_key', 'hero')
    .maybeSingle<HeroRow>()
  const stored = (row?.draft_content ?? row?.content) as Partial<HeroContent> | null
  // If the row exists, only fill TRULY-missing scalar fields with empty strings.
  // Don't pull defaults from HERO_FALLBACK — that would duplicate content into
  // newer fields the row doesn't have (e.g. headline_line_3 when the row was
  // seeded with the old 2-line shape).
  const initial: HeroContent = stored
    ? { ...EMPTY_HERO, ...stored }
    : HERO_FALLBACK
  const hasDraft = !!row?.draft_content
  return <HeroEditor initial={initial} hasDraft={hasDraft} />
}

const EMPTY_HERO: HeroContent = {
  headline_line_1: '',
  headline_line_2: '',
  headline_line_3: '',
  subheadline: '',
  primary_cta_label: '',
  primary_cta_href: '',
  secondary_cta_label: '',
  secondary_cta_href: '',
  media_type: 'video',
  media_url: '',
}
