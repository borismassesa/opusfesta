import { createSupabaseAdminClient } from '@/lib/supabase'
import type { MaybeLocalized } from '@/lib/cms/localized'
import {
  INVITATIONS_NAVBAR_FALLBACK,
  INVITATIONS_NAVBAR_PAGE_KEY,
  NAVBAR_SECTION_KEY,
} from '@/lib/cms/opus-pass-invitations-navbar'
import NavbarEditor from './NavbarEditor'

export const dynamic = 'force-dynamic'

type Row = {
  content: Record<string, MaybeLocalized> | null
  draft_content: Record<string, MaybeLocalized> | null
}

export default async function InvitationsNavbarEditorPage() {
  const supabase = createSupabaseAdminClient()
  const { data: row } = await supabase
    .from('website_page_sections')
    .select('content, draft_content')
    .eq('page_key', INVITATIONS_NAVBAR_PAGE_KEY)
    .eq('section_key', NAVBAR_SECTION_KEY)
    .maybeSingle<Row>()

  const stored = (row?.draft_content ?? row?.content ?? {}) as Record<string, MaybeLocalized>
  const initial: Record<string, MaybeLocalized> = { ...INVITATIONS_NAVBAR_FALLBACK, ...stored }
  const hasDraft = !!row?.draft_content

  return <NavbarEditor initial={initial} hasDraft={hasDraft} />
}
