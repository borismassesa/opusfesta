import { createSupabaseAdminClient } from '@/lib/supabase'
import {
  ADVICE_HERO_FALLBACK,
  ADVICE_IDEAS_PAGE_KEY,
  type AdviceHeroContent,
  type AdvicePageSectionRow,
} from '@/lib/cms/advice-ideas'
import HeroEditor from './HeroEditor'

export const dynamic = 'force-dynamic'

export default async function AdviceHeroPage() {
  const supabase = createSupabaseAdminClient()
  const { data: row } = await supabase
    .from('website_page_sections')
    .select('*')
    .eq('page_key', ADVICE_IDEAS_PAGE_KEY)
    .eq('section_key', 'hero')
    .maybeSingle<AdvicePageSectionRow<AdviceHeroContent>>()

  const stored = (row?.draft_content ?? row?.content) as Partial<AdviceHeroContent> | null
  const initial: AdviceHeroContent = stored
    ? { ...ADVICE_HERO_FALLBACK, ...stored }
    : ADVICE_HERO_FALLBACK
  const hasDraft = !!row?.draft_content

  return <HeroEditor initial={initial} hasDraft={hasDraft} />
}
