import { createSupabaseAdminClient } from '@/lib/supabase'
import {
  OPUS_PASS_HOMEPAGE_MANIFESTO_FALLBACK,
  type OpusPassHomepageManifestoContent,
  type OpusPassHomepageManifestoRow,
} from '@/lib/cms/opus-pass-homepage-manifesto'
import ManifestoEditor from './ManifestoEditor'

export const dynamic = 'force-dynamic'

export default async function OpusPassHomepageManifestoEditorPage() {
  const supabase = createSupabaseAdminClient()
  const { data: row } = await supabase
    .from('website_page_sections')
    .select('*')
    .eq('page_key', 'opus-pass-homepage')
    .eq('section_key', 'manifesto')
    .maybeSingle<OpusPassHomepageManifestoRow>()
  const stored = (row?.draft_content ?? row?.content) as
    | Partial<OpusPassHomepageManifestoContent>
    | null
  const initial: OpusPassHomepageManifestoContent = stored
    ? { ...OPUS_PASS_HOMEPAGE_MANIFESTO_FALLBACK, ...stored }
    : OPUS_PASS_HOMEPAGE_MANIFESTO_FALLBACK
  const hasDraft = !!row?.draft_content
  return <ManifestoEditor initial={initial} hasDraft={hasDraft} />
}
