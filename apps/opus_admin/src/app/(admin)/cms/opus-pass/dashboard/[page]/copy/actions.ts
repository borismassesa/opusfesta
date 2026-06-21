'use server'

import { revalidatePath } from 'next/cache'
import { revalidateOpusPass } from '@/lib/revalidate'
import { createSupabaseAdminClient } from '@/lib/supabase'
import { requirePermission } from '@/lib/admin-auth'
import {
  DASHBOARD_COPY_PAGE_KEY,
  DASHBOARD_COPY_PUBLIC_PATH,
  isDashboardCopySlug,
  type DashboardCopyContent,
  type DashboardCopySlug,
} from '@/lib/cms/opus-pass-dashboard-copy'

const SECTION_KEY = 'copy'

function assertSlug(slug: string): DashboardCopySlug {
  if (!isDashboardCopySlug(slug)) {
    throw new Error(`Unknown dashboard copy slug: ${slug}`)
  }
  return slug
}

function adminPath(slug: DashboardCopySlug): string {
  return `/cms/opus-pass/dashboard/${slug}/copy`
}

export async function saveDashboardCopyDraft(
  slug: string,
  draft: DashboardCopyContent,
): Promise<void> {
  await requirePermission('cms.write')
  const s = assertSlug(slug)
  const supabase = createSupabaseAdminClient()
  const { error } = await supabase
    .from('website_page_sections')
    .upsert(
      { page_key: DASHBOARD_COPY_PAGE_KEY[s], section_key: SECTION_KEY, draft_content: draft },
      { onConflict: 'page_key,section_key', ignoreDuplicates: false },
    )
  if (error) throw error
  revalidatePath(adminPath(s))
}

export async function publishDashboardCopy(slug: string): Promise<void> {
  await requirePermission('cms.publish')
  const s = assertSlug(slug)
  const supabase = createSupabaseAdminClient()
  const { data: row, error: loadErr } = await supabase
    .from('website_page_sections')
    .select('draft_content')
    .eq('page_key', DASHBOARD_COPY_PAGE_KEY[s])
    .eq('section_key', SECTION_KEY)
    .single()
  if (loadErr) throw loadErr
  if (!row?.draft_content) {
    throw new Error('No draft to publish. Save changes first.')
  }

  const { error } = await supabase
    .from('website_page_sections')
    .update({ content: row.draft_content, draft_content: null, is_published: true })
    .eq('page_key', DASHBOARD_COPY_PAGE_KEY[s])
    .eq('section_key', SECTION_KEY)
  if (error) throw error

  revalidatePath(adminPath(s))
  await revalidateOpusPass(DASHBOARD_COPY_PUBLIC_PATH[s])
}

export async function discardDashboardCopyDraft(slug: string): Promise<void> {
  await requirePermission('cms.write')
  const s = assertSlug(slug)
  const supabase = createSupabaseAdminClient()
  const { error } = await supabase
    .from('website_page_sections')
    .update({ draft_content: null })
    .eq('page_key', DASHBOARD_COPY_PAGE_KEY[s])
    .eq('section_key', SECTION_KEY)
  if (error) throw error
  revalidatePath(adminPath(s))
}
