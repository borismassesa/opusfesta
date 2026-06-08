import { notFound } from 'next/navigation'
import { createSupabaseAdminClient } from '@/lib/supabase'
import {
  COPY_FIELD_SCHEMA,
  DASHBOARD_COPY_FALLBACK,
  DASHBOARD_COPY_LABEL,
  DASHBOARD_COPY_PAGE_KEY,
  isDashboardCopySlug,
  type DashboardCopyContent,
  type DashboardCopyRow,
  type DashboardCopySlug,
} from '@/lib/cms/opus-pass-dashboard-copy'
import CopyEditor from './CopyEditor'

export const dynamic = 'force-dynamic'

type RouteParams = { page: string }

export default async function DashboardCopyEditorPage({
  params,
}: {
  params: Promise<RouteParams>
}) {
  const { page } = await params
  if (!isDashboardCopySlug(page)) notFound()
  const slug: DashboardCopySlug = page

  const supabase = createSupabaseAdminClient()
  const { data: row } = await supabase
    .from('website_page_sections')
    .select('*')
    .eq('page_key', DASHBOARD_COPY_PAGE_KEY[slug])
    .eq('section_key', 'copy')
    .maybeSingle<DashboardCopyRow>()

  const stored = (row?.draft_content ?? row?.content ?? {}) as DashboardCopyContent
  const initial: DashboardCopyContent = { ...DASHBOARD_COPY_FALLBACK[slug], ...stored }
  const hasDraft = !!row?.draft_content

  return (
    <CopyEditor
      slug={slug}
      label={DASHBOARD_COPY_LABEL[slug]}
      groups={COPY_FIELD_SCHEMA[slug]}
      initial={initial}
      hasDraft={hasDraft}
    />
  )
}
