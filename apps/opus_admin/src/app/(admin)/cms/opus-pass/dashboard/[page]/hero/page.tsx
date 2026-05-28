import { notFound } from 'next/navigation'
import { createSupabaseAdminClient } from '@/lib/supabase'
import {
  DASHBOARD_HERO_FALLBACK,
  DASHBOARD_HERO_LABEL,
  DASHBOARD_HERO_PAGE_KEY,
  isDashboardHeroSlug,
  type DashboardHeroContent,
  type DashboardHeroRow,
  type DashboardHeroSlug,
} from '@/lib/cms/opus-pass-dashboard-hero'
import HeroEditor from './HeroEditor'

export const dynamic = 'force-dynamic'

type RouteParams = { page: string }

export default async function DashboardHeroEditorPage({
  params,
}: {
  params: Promise<RouteParams>
}) {
  const { page } = await params
  if (!isDashboardHeroSlug(page)) notFound()
  const slug: DashboardHeroSlug = page

  const supabase = createSupabaseAdminClient()
  const { data: row } = await supabase
    .from('website_page_sections')
    .select('*')
    .eq('page_key', DASHBOARD_HERO_PAGE_KEY[slug])
    .eq('section_key', 'hero')
    .maybeSingle<DashboardHeroRow>()

  const stored = (row?.draft_content ?? row?.content) as
    | Partial<DashboardHeroContent>
    | null
  const initial: DashboardHeroContent = stored
    ? { ...DASHBOARD_HERO_FALLBACK[slug], ...stored }
    : DASHBOARD_HERO_FALLBACK[slug]
  const hasDraft = !!row?.draft_content

  return (
    <HeroEditor
      slug={slug}
      label={DASHBOARD_HERO_LABEL[slug]}
      initial={initial}
      hasDraft={hasDraft}
    />
  )
}
