import { createSupabaseAdminClient } from '@/lib/supabase'
import {
  DO_MORE_FALLBACK,
  type DoMoreContent,
  type DoMoreRow,
} from '@/lib/cms/do-more'
import DoMoreEditor from './DoMoreEditor'

export const dynamic = 'force-dynamic'

export default async function DoMoreEditorPage() {
  const supabase = createSupabaseAdminClient()
  const { data: row } = await supabase
    .from('website_page_sections')
    .select('*')
    .eq('page_key', 'home')
    .eq('section_key', 'do-more')
    .maybeSingle<DoMoreRow>()
  const stored = (row?.draft_content ?? row?.content) as Partial<DoMoreContent> | null
  const initial: DoMoreContent = stored
    ? {
        ...DO_MORE_FALLBACK,
        ...stored,
        websites:
          Array.isArray(stored.websites) && stored.websites.length > 0
            ? stored.websites
            : DO_MORE_FALLBACK.websites,
        guests:
          Array.isArray(stored.guests) && stored.guests.length > 0
            ? stored.guests
            : DO_MORE_FALLBACK.guests,
      }
    : DO_MORE_FALLBACK
  const hasDraft = !!row?.draft_content
  return <DoMoreEditor initial={initial} hasDraft={hasDraft} />
}
