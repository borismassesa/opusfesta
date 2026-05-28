'use server'

import { revalidatePath } from 'next/cache'
import { revalidateOpusPass } from '@/lib/revalidate'
import { createSupabaseAdminClient } from '@/lib/supabase'
import {
  DASHBOARD_HERO_PAGE_KEY,
  DASHBOARD_HERO_PUBLIC_PATH,
  isDashboardHeroSlug,
  type DashboardHeroContent,
  type DashboardHeroSlug,
} from '@/lib/cms/opus-pass-dashboard-hero'

const SECTION_KEY = 'hero'

function assertSlug(slug: string): DashboardHeroSlug {
  if (!isDashboardHeroSlug(slug)) {
    throw new Error(`Unknown dashboard hero slug: ${slug}`)
  }
  return slug
}

function adminPath(slug: DashboardHeroSlug): string {
  return `/cms/opus-pass/dashboard/${slug}/hero`
}

export async function saveDashboardHeroDraft(
  slug: string,
  draft: DashboardHeroContent,
): Promise<void> {
  const s = assertSlug(slug)
  const supabase = createSupabaseAdminClient()
  const { error } = await supabase
    .from('website_page_sections')
    .upsert(
      { page_key: DASHBOARD_HERO_PAGE_KEY[s], section_key: SECTION_KEY, draft_content: draft },
      { onConflict: 'page_key,section_key', ignoreDuplicates: false },
    )
  if (error) throw error
  revalidatePath(adminPath(s))
}

export async function publishDashboardHero(slug: string): Promise<void> {
  const s = assertSlug(slug)
  const supabase = createSupabaseAdminClient()
  const { data: row, error: loadErr } = await supabase
    .from('website_page_sections')
    .select('draft_content')
    .eq('page_key', DASHBOARD_HERO_PAGE_KEY[s])
    .eq('section_key', SECTION_KEY)
    .single()
  if (loadErr) throw loadErr
  if (!row?.draft_content) {
    throw new Error('No draft to publish. Save changes first.')
  }

  const { error } = await supabase
    .from('website_page_sections')
    .update({ content: row.draft_content, draft_content: null, is_published: true })
    .eq('page_key', DASHBOARD_HERO_PAGE_KEY[s])
    .eq('section_key', SECTION_KEY)
  if (error) throw error

  revalidatePath(adminPath(s))
  await revalidateOpusPass(DASHBOARD_HERO_PUBLIC_PATH[s])
}

export async function discardDashboardHeroDraft(slug: string): Promise<void> {
  const s = assertSlug(slug)
  const supabase = createSupabaseAdminClient()
  const { error } = await supabase
    .from('website_page_sections')
    .update({ draft_content: null })
    .eq('page_key', DASHBOARD_HERO_PAGE_KEY[s])
    .eq('section_key', SECTION_KEY)
  if (error) throw error
  revalidatePath(adminPath(s))
}
