import { createSupabaseAdminClient } from '@/lib/supabase'
import {
  CATEGORY_MARQUEE_FALLBACK,
  type CategoryMarqueeContent,
  type CategoryMarqueeRow,
} from '@/lib/cms/category-marquee'
import CategoryMarqueeEditor from './CategoryMarqueeEditor'

export const dynamic = 'force-dynamic'

export default async function CategoryMarqueeEditorPage() {
  const supabase = createSupabaseAdminClient()
  const { data: row } = await supabase
    .from('website_page_sections')
    .select('*')
    .eq('page_key', 'vendors_home')
    .eq('section_key', 'category-marquee')
    .maybeSingle<CategoryMarqueeRow>()
  const stored = (row?.draft_content ?? row?.content) as Partial<CategoryMarqueeContent> | null
  const initial: CategoryMarqueeContent =
    stored && Array.isArray(stored.items) && stored.items.length > 0
      ? { items: stored.items }
      : CATEGORY_MARQUEE_FALLBACK
  const hasDraft = !!row?.draft_content
  return <CategoryMarqueeEditor initial={initial} hasDraft={hasDraft} />
}
