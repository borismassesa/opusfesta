import { createSupabaseAdminClient } from '@/lib/supabase'
import { ATTIRE_HERO_FALLBACK, type AttireHeroContent, type AttireHeroRow } from '@/lib/cms/attire-hero'
import HeroEditor from './HeroEditor'

export const dynamic = 'force-dynamic'

const EMPTY: AttireHeroContent = {
  headline: '',
  description: '',
  cta_label: '',
  cta_href: '',
  main_image_url: '',
  card_image_url: '',
  card_heading: '',
  card_link_label: '',
  card_href: '',
}

export default async function AttireHeroEditorPage() {
  const supabase = createSupabaseAdminClient()
  const { data: row } = await supabase
    .from('website_page_sections')
    .select('*')
    .eq('page_key', 'attire-and-rings')
    .eq('section_key', 'hero')
    .maybeSingle<AttireHeroRow>()
  const stored = (row?.draft_content ?? row?.content) as Partial<AttireHeroContent> | null
  const initial: AttireHeroContent = stored ? { ...EMPTY, ...stored } : ATTIRE_HERO_FALLBACK
  const hasDraft = !!row?.draft_content
  return <HeroEditor initial={initial} hasDraft={hasDraft} />
}
