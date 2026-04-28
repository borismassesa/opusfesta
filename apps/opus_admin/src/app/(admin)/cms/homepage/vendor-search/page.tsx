import { createSupabaseAdminClient } from '@/lib/supabase'
import {
  VENDOR_SEARCH_FALLBACK,
  type VendorSearchContent,
  type VendorSearchRow,
} from '@/lib/cms/vendor-search'
import VendorSearchEditor from './VendorSearchEditor'

export const dynamic = 'force-dynamic'

export default async function VendorSearchEditorPage() {
  const supabase = createSupabaseAdminClient()
  const { data: row } = await supabase
    .from('website_page_sections')
    .select('*')
    .eq('page_key', 'home')
    .eq('section_key', 'vendor-search')
    .maybeSingle<VendorSearchRow>()
  const stored = (row?.draft_content ?? row?.content) as Partial<VendorSearchContent> | null
  const initial: VendorSearchContent =
    stored && Array.isArray(stored.items) && stored.items.length > 0
      ? { ...VENDOR_SEARCH_FALLBACK, ...stored, items: stored.items }
      : VENDOR_SEARCH_FALLBACK
  const hasDraft = !!row?.draft_content
  return <VendorSearchEditor initial={initial} hasDraft={hasDraft} />
}
