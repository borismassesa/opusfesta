import { createSupabaseAdminClient } from '@/lib/supabase'
import {
  OPUS_PASS_INVITATIONS_CATEGORIES_FALLBACK,
  type OpusPassInvitationsCategoriesContent,
  type OpusPassInvitationsCategoriesRow,
} from '@/lib/cms/opus-pass-invitations-categories'
import CategoriesEditor from './CategoriesEditor'

export const dynamic = 'force-dynamic'

export default async function OpusPassInvitationsCategoriesEditorPage() {
  const supabase = createSupabaseAdminClient()
  const { data: row } = await supabase
    .from('website_page_sections')
    .select('*')
    .eq('page_key', 'opus-pass-invitations')
    .eq('section_key', 'categories')
    .maybeSingle<OpusPassInvitationsCategoriesRow>()
  const stored = (row?.draft_content ?? row?.content) as
    | Partial<OpusPassInvitationsCategoriesContent>
    | null
  const initial: OpusPassInvitationsCategoriesContent = stored
    ? {
        heading: stored.heading ?? OPUS_PASS_INVITATIONS_CATEGORIES_FALLBACK.heading,
        description: stored.description ?? OPUS_PASS_INVITATIONS_CATEGORIES_FALLBACK.description,
        categories:
          stored.categories && Array.isArray(stored.categories) && stored.categories.length > 0
            ? stored.categories
            : OPUS_PASS_INVITATIONS_CATEGORIES_FALLBACK.categories,
      }
    : OPUS_PASS_INVITATIONS_CATEGORIES_FALLBACK
  const hasDraft = !!row?.draft_content
  return <CategoriesEditor initial={initial} hasDraft={hasDraft} />
}
