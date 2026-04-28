import { createSupabaseAdminClient } from '@/lib/supabase'
import {
  ADVICE_IDEAS_PAGE_KEY,
  ADVICE_SECTION_HEADERS_FALLBACK,
  type AdvicePageSectionRow,
  type AdviceSectionHeadersContent,
} from '@/lib/cms/advice-ideas'
import SectionHeadersEditor from './SectionHeadersEditor'

export const dynamic = 'force-dynamic'

export default async function AdviceSectionHeadersPage() {
  const supabase = createSupabaseAdminClient()
  const { data: row } = await supabase
    .from('website_page_sections')
    .select('*')
    .eq('page_key', ADVICE_IDEAS_PAGE_KEY)
    .eq('section_key', 'section_headers')
    .maybeSingle<AdvicePageSectionRow<AdviceSectionHeadersContent>>()

  const stored = (row?.draft_content ?? row?.content) as Partial<AdviceSectionHeadersContent> | null
  const initial = mergeWithFallback(stored)
  const hasDraft = !!row?.draft_content

  return <SectionHeadersEditor initial={initial} hasDraft={hasDraft} />
}

function mergeWithFallback(
  stored: Partial<AdviceSectionHeadersContent> | null
): AdviceSectionHeadersContent {
  if (!stored) return ADVICE_SECTION_HEADERS_FALLBACK
  return {
    editor_picks: { ...ADVICE_SECTION_HEADERS_FALLBACK.editor_picks, ...(stored.editor_picks ?? {}) },
    popular_topics: { ...ADVICE_SECTION_HEADERS_FALLBACK.popular_topics, ...(stored.popular_topics ?? {}) },
    loved_by_couples: { ...ADVICE_SECTION_HEADERS_FALLBACK.loved_by_couples, ...(stored.loved_by_couples ?? {}) },
    favorites: { ...ADVICE_SECTION_HEADERS_FALLBACK.favorites, ...(stored.favorites ?? {}) },
    latest_stories: { ...ADVICE_SECTION_HEADERS_FALLBACK.latest_stories, ...(stored.latest_stories ?? {}) },
    search: { ...ADVICE_SECTION_HEADERS_FALLBACK.search, ...(stored.search ?? {}) },
  }
}
