import { createSupabaseAdminClient } from '@/lib/supabase'
import {
  OPUS_PASS_PROMISES_FALLBACK,
  type OpusPassPromisesContent,
  type OpusPassPromisesRow,
} from '@/lib/cms/opus-pass-promises'
import PromisesEditor from './PromisesEditor'

export const dynamic = 'force-dynamic'

export default async function OpusPassPromisesEditorPage() {
  const supabase = createSupabaseAdminClient()
  const { data: row } = await supabase
    .from('website_page_sections')
    .select('*')
    .eq('page_key', 'opus-pass-homepage')
    .eq('section_key', 'promises')
    .maybeSingle<OpusPassPromisesRow>()
  const stored = (row?.draft_content ?? row?.content) as Partial<OpusPassPromisesContent> | null
  const initial: OpusPassPromisesContent =
    stored?.items && Array.isArray(stored.items) && stored.items.length > 0
      ? { items: stored.items }
      : OPUS_PASS_PROMISES_FALLBACK
  const hasDraft = !!row?.draft_content
  return <PromisesEditor initial={initial} hasDraft={hasDraft} />
}
