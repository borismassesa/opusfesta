import { createSupabaseAdminClient } from '@/lib/supabase'
import {
  OPUS_PASS_HOMEPAGE_SHOWCASE_FALLBACK,
  type OpusPassHomepageShowcaseContent,
  type OpusPassHomepageShowcaseRow,
} from '@/lib/cms/opus-pass-homepage-showcase'
import ShowcaseEditor from './ShowcaseEditor'

export const dynamic = 'force-dynamic'

export default async function OpusPassHomepageShowcaseEditorPage() {
  const supabase = createSupabaseAdminClient()
  const { data: row } = await supabase
    .from('website_page_sections')
    .select('*')
    .eq('page_key', 'opus-pass-homepage')
    .eq('section_key', 'showcase')
    .maybeSingle<OpusPassHomepageShowcaseRow>()
  const stored = (row?.draft_content ?? row?.content) as
    | Partial<OpusPassHomepageShowcaseContent>
    | null
  const initial: OpusPassHomepageShowcaseContent = stored
    ? {
        caption: { ...OPUS_PASS_HOMEPAGE_SHOWCASE_FALLBACK.caption, ...stored.caption },
        images:
          stored.images && Array.isArray(stored.images) && stored.images.length > 0
            ? stored.images
            : OPUS_PASS_HOMEPAGE_SHOWCASE_FALLBACK.images,
        pills: { ...OPUS_PASS_HOMEPAGE_SHOWCASE_FALLBACK.pills, ...stored.pills },
        accent_color: stored.accent_color || OPUS_PASS_HOMEPAGE_SHOWCASE_FALLBACK.accent_color,
      }
    : OPUS_PASS_HOMEPAGE_SHOWCASE_FALLBACK
  const hasDraft = !!row?.draft_content
  return <ShowcaseEditor initial={initial} hasDraft={hasDraft} />
}
