import { createSupabaseAdminClient } from '@/lib/supabase'
import {
  ATTIRE_LOVED_CATEGORIES_FALLBACK,
  type AttireCategoriesContent,
  type AttireCategoriesRow,
} from '@/lib/cms/attire-categories'
import LovedCategoriesEditor from './LovedCategoriesEditor'

export const dynamic = 'force-dynamic'

const EMPTY: AttireCategoriesContent = { title: '', items: [] }

export default async function AttireLovedCategoriesEditorPage() {
  const supabase = createSupabaseAdminClient()
  const { data: row } = await supabase
    .from('website_page_sections')
    .select('*')
    .eq('page_key', 'attire-and-rings')
    .eq('section_key', 'loved-categories')
    .maybeSingle<AttireCategoriesRow>()
  const stored = (row?.draft_content ?? row?.content) as Partial<AttireCategoriesContent> | null
  const initial: AttireCategoriesContent = stored ? { ...EMPTY, ...stored } : ATTIRE_LOVED_CATEGORIES_FALLBACK
  return <LovedCategoriesEditor initial={initial} hasDraft={!!row?.draft_content} />
}
