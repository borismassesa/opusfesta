import { createSupabaseAdminClient } from '@/lib/supabase'
import {
  PRICING_COMPARISON_FALLBACK,
  type PricingComparisonContent,
  type PricingComparisonRow,
} from '@/lib/cms/pricing-comparison'
import PricingComparisonEditor from './PricingComparisonEditor'

export const dynamic = 'force-dynamic'

export default async function PricingComparisonEditorPage() {
  const supabase = createSupabaseAdminClient()
  const { data: row } = await supabase
    .from('website_page_sections')
    .select('*')
    .eq('page_key', 'home')
    .eq('section_key', 'pricing-comparison')
    .maybeSingle<PricingComparisonRow>()
  const stored = (row?.draft_content ?? row?.content) as
    | Partial<PricingComparisonContent>
    | null
  const initial: PricingComparisonContent = stored
    ? {
        ...PRICING_COMPARISON_FALLBACK,
        ...stored,
        checklist:
          Array.isArray(stored.checklist) && stored.checklist.length > 0
            ? stored.checklist
            : PRICING_COMPARISON_FALLBACK.checklist,
        features:
          Array.isArray(stored.features) && stored.features.length > 0
            ? stored.features
            : PRICING_COMPARISON_FALLBACK.features,
      }
    : PRICING_COMPARISON_FALLBACK
  const hasDraft = !!row?.draft_content
  return <PricingComparisonEditor initial={initial} hasDraft={hasDraft} />
}
