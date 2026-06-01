import { createSupabaseAdminClient } from '@/lib/supabase'
import {
  OPUS_PASS_HOMEPAGE_WHY_OPUS_PASS_FALLBACK,
  type OpusPassHomepageWhyOpusPassContent,
  type OpusPassHomepageWhyOpusPassRow,
} from '@/lib/cms/opus-pass-homepage-why-opus-pass'
import WhyOpusPassEditor from './WhyOpusPassEditor'

export const dynamic = 'force-dynamic'

export default async function OpusPassHomepageWhyOpusPassEditorPage() {
  const supabase = createSupabaseAdminClient()
  const { data: row } = await supabase
    .from('website_page_sections')
    .select('*')
    .eq('page_key', 'opus-pass-homepage')
    .eq('section_key', 'why-opus-pass')
    .maybeSingle<OpusPassHomepageWhyOpusPassRow>()
  const stored = (row?.draft_content ?? row?.content) as
    | Partial<OpusPassHomepageWhyOpusPassContent>
    | null
  const initial: OpusPassHomepageWhyOpusPassContent = stored
    ? { ...OPUS_PASS_HOMEPAGE_WHY_OPUS_PASS_FALLBACK, ...stored }
    : OPUS_PASS_HOMEPAGE_WHY_OPUS_PASS_FALLBACK
  const hasDraft = !!row?.draft_content
  return <WhyOpusPassEditor initial={initial} hasDraft={hasDraft} />
}
