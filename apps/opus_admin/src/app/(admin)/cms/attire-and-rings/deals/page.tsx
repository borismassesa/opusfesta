import { createSupabaseAdminClient } from '@/lib/supabase'
import {
  ATTIRE_DEALS_FALLBACK,
  type AttireDealsContent,
  type AttireDealsRow,
} from '@/lib/cms/attire-deals'
import DealsEditor from './DealsEditor'

export const dynamic = 'force-dynamic'

const EMPTY: AttireDealsContent = { heading: '', items: [] }

export default async function AttireDealsEditorPage() {
  const supabase = createSupabaseAdminClient()
  const { data: row } = await supabase
    .from('website_page_sections')
    .select('*')
    .eq('page_key', 'attire-and-rings')
    .eq('section_key', 'deals')
    .maybeSingle<AttireDealsRow>()
  const stored = (row?.draft_content ?? row?.content) as Partial<AttireDealsContent> | null
  const initial: AttireDealsContent = stored ? { ...EMPTY, ...stored } : ATTIRE_DEALS_FALLBACK
  return <DealsEditor initial={initial} hasDraft={!!row?.draft_content} />
}
