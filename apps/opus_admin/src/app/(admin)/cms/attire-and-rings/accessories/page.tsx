import { createSupabaseAdminClient } from '@/lib/supabase'
import {
  ATTIRE_ACCESSORIES_FALLBACK,
  type AttireAccessoriesContent,
  type AttireAccessoriesRow,
} from '@/lib/cms/attire-accessories'
import AccessoriesEditor from './AccessoriesEditor'

export const dynamic = 'force-dynamic'

const EMPTY: AttireAccessoriesContent = { heading: '', items: [] }

export default async function AttireAccessoriesEditorPage() {
  const supabase = createSupabaseAdminClient()
  const { data: row } = await supabase
    .from('website_page_sections')
    .select('*')
    .eq('page_key', 'attire-and-rings')
    .eq('section_key', 'accessories')
    .maybeSingle<AttireAccessoriesRow>()
  const stored = (row?.draft_content ?? row?.content) as Partial<AttireAccessoriesContent> | null
  const initial: AttireAccessoriesContent = stored ? { ...EMPTY, ...stored } : ATTIRE_ACCESSORIES_FALLBACK
  return <AccessoriesEditor initial={initial} hasDraft={!!row?.draft_content} />
}
