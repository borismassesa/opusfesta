import { createSupabaseAdminClient } from '@/lib/supabase'
import {
  ATTIRE_STANDOUT_STYLES_FALLBACK,
  type AttireStandoutStylesContent,
  type AttireStandoutStylesRow,
} from '@/lib/cms/attire-standout-styles'
import StandoutStylesEditor from './StandoutStylesEditor'

export const dynamic = 'force-dynamic'

const EMPTY: AttireStandoutStylesContent = { heading: '', items: [] }

export default async function AttireStandoutStylesEditorPage() {
  const supabase = createSupabaseAdminClient()
  const { data: row } = await supabase
    .from('website_page_sections')
    .select('*')
    .eq('page_key', 'attire-and-rings')
    .eq('section_key', 'standout-styles')
    .maybeSingle<AttireStandoutStylesRow>()
  const stored = (row?.draft_content ?? row?.content) as Partial<AttireStandoutStylesContent> | null
  const initial: AttireStandoutStylesContent = stored ? { ...EMPTY, ...stored } : ATTIRE_STANDOUT_STYLES_FALLBACK
  return <StandoutStylesEditor initial={initial} hasDraft={!!row?.draft_content} />
}
