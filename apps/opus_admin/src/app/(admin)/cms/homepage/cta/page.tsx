import { createSupabaseAdminClient } from '@/lib/supabase'
import { CTA_FALLBACK, type CtaContent, type CtaRow } from '@/lib/cms/cta'
import CtaEditor from './CtaEditor'

export const dynamic = 'force-dynamic'

export default async function CtaEditorPage() {
  const supabase = createSupabaseAdminClient()
  const { data: row } = await supabase
    .from('website_page_sections')
    .select('*')
    .eq('page_key', 'home')
    .eq('section_key', 'cta')
    .maybeSingle<CtaRow>()
  const stored = (row?.draft_content ?? row?.content) as Partial<CtaContent> | null
  const initial: CtaContent = stored ? { ...CTA_FALLBACK, ...stored } : CTA_FALLBACK
  const hasDraft = !!row?.draft_content
  return <CtaEditor initial={initial} hasDraft={hasDraft} />
}
