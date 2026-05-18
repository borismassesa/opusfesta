import { createSupabaseAdminClient } from '@/lib/supabase'
import {
  ATTIRE_GIFT_SECTION_FALLBACK,
  type AttireGiftSectionContent,
  type AttireGiftSectionRow,
} from '@/lib/cms/attire-gift-section'
import GiftSectionEditor from './GiftSectionEditor'

export const dynamic = 'force-dynamic'

const EMPTY: AttireGiftSectionContent = { heading: '', cta_label: '', gifts: [] }

export default async function AttireGiftSectionEditorPage() {
  const supabase = createSupabaseAdminClient()
  const { data: row } = await supabase
    .from('website_page_sections')
    .select('*')
    .eq('page_key', 'attire-and-rings')
    .eq('section_key', 'gift-section')
    .maybeSingle<AttireGiftSectionRow>()
  const stored = (row?.draft_content ?? row?.content) as Partial<AttireGiftSectionContent> | null
  const initial: AttireGiftSectionContent = stored ? { ...EMPTY, ...stored } : ATTIRE_GIFT_SECTION_FALLBACK
  return <GiftSectionEditor initial={initial} hasDraft={!!row?.draft_content} />
}
