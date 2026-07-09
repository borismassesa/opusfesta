'use server'

import { revalidatePath } from 'next/cache'
import { createSupabaseAdminClient } from '@/lib/supabase'
import { requirePermission } from '@/lib/admin-auth'
import {
  UI_STRINGS_PAGE_KEY,
  isUiArea,
  type UiArea,
  type UiStringsContent,
} from '@/lib/cms/vendors-portal-ui-strings'

const SECTION_KEY = 'copy'

function assertArea(area: string): UiArea {
  if (!isUiArea(area)) {
    throw new Error(`Unknown Site UI area: ${area}`)
  }
  return area
}

function adminPath(area: UiArea): string {
  return `/cms/vendors-portal/site-ui/${area}`
}

export async function saveUiStringsDraft(area: string, draft: UiStringsContent): Promise<void> {
  await requirePermission('cms.write')
  const a = assertArea(area)
  const supabase = createSupabaseAdminClient()
  const { error } = await supabase
    .from('website_page_sections')
    .upsert(
      { page_key: UI_STRINGS_PAGE_KEY[a], section_key: SECTION_KEY, draft_content: draft },
      { onConflict: 'page_key,section_key', ignoreDuplicates: false },
    )
  if (error) throw error
  revalidatePath(adminPath(a))
}

// Vendors_portal's root layout is already `export const dynamic =
// 'force-dynamic'` app-wide, so every request re-reads Supabase fresh — unlike
// OpusPass, there's no cross-deployment revalidation call here (the equivalent
// `revalidateVendorsPortal()` helper in ../../../../lib/revalidate.ts exists
// but is intentionally left unwired for Site UI; publishing takes effect on
// the very next request with no cache to invalidate).
export async function publishUiStrings(area: string): Promise<void> {
  await requirePermission('cms.publish')
  const a = assertArea(area)
  const supabase = createSupabaseAdminClient()
  const { data: row, error: loadErr } = await supabase
    .from('website_page_sections')
    .select('draft_content')
    .eq('page_key', UI_STRINGS_PAGE_KEY[a])
    .eq('section_key', SECTION_KEY)
    .single()
  if (loadErr) throw loadErr
  if (!row?.draft_content) {
    throw new Error('No draft to publish. Save changes first.')
  }

  const { error } = await supabase
    .from('website_page_sections')
    .update({ content: row.draft_content, draft_content: null, is_published: true })
    .eq('page_key', UI_STRINGS_PAGE_KEY[a])
    .eq('section_key', SECTION_KEY)
  if (error) throw error

  revalidatePath(adminPath(a))
}

export async function discardUiStringsDraft(area: string): Promise<void> {
  await requirePermission('cms.write')
  const a = assertArea(area)
  const supabase = createSupabaseAdminClient()
  const { error } = await supabase
    .from('website_page_sections')
    .update({ draft_content: null })
    .eq('page_key', UI_STRINGS_PAGE_KEY[a])
    .eq('section_key', SECTION_KEY)
  if (error) throw error
  revalidatePath(adminPath(a))
}
