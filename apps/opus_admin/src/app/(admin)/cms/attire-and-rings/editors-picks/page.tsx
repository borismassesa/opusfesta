import { createSupabaseAdminClient } from '@/lib/supabase'
import {
  ATTIRE_EDITORS_PICKS_FALLBACK,
  type AttireEditorsPicksContent,
  type AttireEditorsPicksRow,
} from '@/lib/cms/attire-editors-picks'
import EditorsPicksEditor from './EditorsPicksEditor'

export const dynamic = 'force-dynamic'

const EMPTY: AttireEditorsPicksContent = {
  eyebrow: '',
  heading: '',
  cta_label: '',
  footer_text: '',
  row1: [],
  row2: [],
}

export default async function AttireEditorsPicksEditorPage() {
  const supabase = createSupabaseAdminClient()
  const { data: row } = await supabase
    .from('website_page_sections')
    .select('*')
    .eq('page_key', 'attire-and-rings')
    .eq('section_key', 'editors-picks')
    .maybeSingle<AttireEditorsPicksRow>()
  const stored = (row?.draft_content ?? row?.content) as Partial<AttireEditorsPicksContent> | null
  const initial: AttireEditorsPicksContent = stored ? { ...EMPTY, ...stored } : ATTIRE_EDITORS_PICKS_FALLBACK
  return <EditorsPicksEditor initial={initial} hasDraft={!!row?.draft_content} />
}
