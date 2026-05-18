import { createSupabaseAdminClient } from '@/lib/supabase'
import {
  ATTIRE_LOCAL_SHOPS_FALLBACK,
  type AttireLocalShopsContent,
  type AttireLocalShopsRow,
} from '@/lib/cms/attire-local-shops'
import LocalShopsEditor from './LocalShopsEditor'

export const dynamic = 'force-dynamic'

const EMPTY: AttireLocalShopsContent = { eyebrow: '', heading: '', cta_label: '', shops: [] }

export default async function AttireLocalShopsEditorPage() {
  const supabase = createSupabaseAdminClient()
  const { data: row } = await supabase
    .from('website_page_sections')
    .select('*')
    .eq('page_key', 'attire-and-rings')
    .eq('section_key', 'local-shops')
    .maybeSingle<AttireLocalShopsRow>()
  const stored = (row?.draft_content ?? row?.content) as Partial<AttireLocalShopsContent> | null
  const initial: AttireLocalShopsContent = stored ? { ...EMPTY, ...stored } : ATTIRE_LOCAL_SHOPS_FALLBACK
  return <LocalShopsEditor initial={initial} hasDraft={!!row?.draft_content} />
}
