import { createSupabaseAdminClient } from '@/lib/supabase'
import {
  ADVICE_IDEAS_PAGE_KEY,
  ADVICE_TOPICS_FALLBACK,
  type AdvicePageSectionRow,
  type AdviceTopicsContent,
} from '@/lib/cms/advice-ideas'
import TopicsEditor from './TopicsEditor'

export const dynamic = 'force-dynamic'

export default async function AdviceTopicsPage() {
  const supabase = createSupabaseAdminClient()
  const { data: row } = await supabase
    .from('website_page_sections')
    .select('*')
    .eq('page_key', ADVICE_IDEAS_PAGE_KEY)
    .eq('section_key', 'topics')
    .maybeSingle<AdvicePageSectionRow<AdviceTopicsContent>>()

  const stored = (row?.draft_content ?? row?.content) as Partial<AdviceTopicsContent> | null
  const initial: AdviceTopicsContent =
    stored && Array.isArray(stored.items) && stored.items.length > 0
      ? { items: stored.items }
      : ADVICE_TOPICS_FALLBACK
  const hasDraft = !!row?.draft_content

  return <TopicsEditor initial={initial} hasDraft={hasDraft} />
}
