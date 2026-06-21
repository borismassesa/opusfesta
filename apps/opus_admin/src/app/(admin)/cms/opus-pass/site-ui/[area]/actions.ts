'use server'

import { revalidatePath } from 'next/cache'
import { revalidateOpusPass } from '@/lib/revalidate'
import { createSupabaseAdminClient } from '@/lib/supabase'
import { requirePermission } from '@/lib/admin-auth'
import {
  UI_STRINGS_PAGE_KEY,
  UI_STRINGS_PUBLIC_PATH,
  isUiArea,
  type UiArea,
  type UiStringsContent,
} from '@/lib/cms/opus-pass-ui-strings'

const SECTION_KEY = 'copy'

function assertArea(area: string): UiArea {
  if (!isUiArea(area)) {
    throw new Error(`Unknown Site UI area: ${area}`)
  }
  return area
}

function adminPath(area: UiArea): string {
  return `/cms/opus-pass/site-ui/${area}`
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
  // Navbar + footer render on every public page, so revalidate the home page
  // alongside the area's canonical public path (both are '/' today, deduped).
  const paths = Array.from(new Set([UI_STRINGS_PUBLIC_PATH[a], '/']))
  await revalidateOpusPass(...paths)
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
