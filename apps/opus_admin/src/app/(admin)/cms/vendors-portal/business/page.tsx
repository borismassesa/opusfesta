import { createSupabaseAdminClient } from '@/lib/supabase'
import {
  BUSINESS_FALLBACK,
  type BusinessContent,
  type BusinessRow,
} from '@/lib/cms/business'
import BusinessEditor from './BusinessEditor'

export const dynamic = 'force-dynamic'

export default async function BusinessEditorPage() {
  const supabase = createSupabaseAdminClient()
  const { data: row } = await supabase
    .from('website_page_sections')
    .select('*')
    .eq('page_key', 'vendors_home')
    .eq('section_key', 'business')
    .maybeSingle<BusinessRow>()
  const stored = (row?.draft_content ?? row?.content) as Partial<BusinessContent> | null
  const initial: BusinessContent = stored
    ? {
        ...BUSINESS_FALLBACK,
        ...stored,
        feature_pills:
          Array.isArray(stored.feature_pills) && stored.feature_pills.length > 0
            ? stored.feature_pills
            : BUSINESS_FALLBACK.feature_pills,
        vendors:
          Array.isArray(stored.vendors) && stored.vendors.length > 0
            ? stored.vendors
            : BUSINESS_FALLBACK.vendors,
      }
    : BUSINESS_FALLBACK
  const hasDraft = !!row?.draft_content
  return <BusinessEditor initial={initial} hasDraft={hasDraft} />
}
