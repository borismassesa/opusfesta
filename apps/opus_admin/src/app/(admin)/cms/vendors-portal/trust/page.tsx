import { createSupabaseAdminClient } from '@/lib/supabase'
import { TRUST_FALLBACK, type TrustContent, type TrustRow } from '@/lib/cms/trust'
import TrustEditor from './TrustEditor'

export const dynamic = 'force-dynamic'

export default async function TrustEditorPage() {
  const supabase = createSupabaseAdminClient()
  const { data: row } = await supabase
    .from('website_page_sections')
    .select('*')
    .eq('page_key', 'vendors_home')
    .eq('section_key', 'trust')
    .maybeSingle<TrustRow>()
  const stored = (row?.draft_content ?? row?.content) as Partial<TrustContent> | null
  const initial: TrustContent =
    stored && Array.isArray(stored.items) && stored.items.length > 0
      ? { items: stored.items }
      : TRUST_FALLBACK
  const hasDraft = !!row?.draft_content
  return <TrustEditor initial={initial} hasDraft={hasDraft} />
}
