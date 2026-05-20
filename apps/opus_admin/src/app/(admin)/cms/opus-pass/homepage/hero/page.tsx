import { createSupabaseAdminClient } from '@/lib/supabase'
import {
  OPUS_PASS_HERO_FALLBACK,
  type OpusPassHeroContent,
  type OpusPassHeroRow,
} from '@/lib/cms/opus-pass-hero'
import HeroEditor from './HeroEditor'

export const dynamic = 'force-dynamic'

const EMPTY: OpusPassHeroContent = {
  headline_line_1: '',
  headline_line_2: '',
  description: '',
  primary_cta_label: '',
  primary_cta_href: '',
  secondary_cta_label: '',
  secondary_cta_href: '',
  main_image_url: '',
  card_image_url: '',
  card_heading: '',
  card_link_label: '',
  card_href: '',
}

export default async function OpusPassHeroEditorPage() {
  const supabase = createSupabaseAdminClient()
  const { data: row } = await supabase
    .from('website_page_sections')
    .select('*')
    .eq('page_key', 'opus-pass-homepage')
    .eq('section_key', 'hero')
    .maybeSingle<OpusPassHeroRow>()
  const stored = (row?.draft_content ?? row?.content) as Partial<OpusPassHeroContent> | null
  const initial: OpusPassHeroContent = stored ? { ...EMPTY, ...stored } : OPUS_PASS_HERO_FALLBACK
  const hasDraft = !!row?.draft_content
  return <HeroEditor initial={initial} hasDraft={hasDraft} />
}
