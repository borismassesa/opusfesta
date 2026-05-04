import { createSupabaseAdminClient } from '@/lib/supabase'
import { FAQ_FALLBACK, type FaqContent, type FaqRow } from '@/lib/cms/faq'
import FaqEditor from './FaqEditor'

export const dynamic = 'force-dynamic'

export default async function FaqEditorPage() {
  const supabase = createSupabaseAdminClient()
  const { data: row } = await supabase
    .from('website_page_sections')
    .select('*')
    .eq('page_key', 'vendors_home')
    .eq('section_key', 'faq')
    .maybeSingle<FaqRow>()
  const stored = (row?.draft_content ?? row?.content) as Partial<FaqContent> | null
  const initial: FaqContent = stored
    ? {
        ...FAQ_FALLBACK,
        ...stored,
        items:
          Array.isArray(stored.items) && stored.items.length > 0
            ? stored.items
            : FAQ_FALLBACK.items,
      }
    : FAQ_FALLBACK
  const hasDraft = !!row?.draft_content
  return <FaqEditor initial={initial} hasDraft={hasDraft} />
}
