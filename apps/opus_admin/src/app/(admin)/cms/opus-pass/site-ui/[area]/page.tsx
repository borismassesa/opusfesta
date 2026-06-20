import { notFound } from 'next/navigation'
import { createSupabaseAdminClient } from '@/lib/supabase'
import {
  UI_STRINGS_FALLBACK,
  UI_STRINGS_LABEL,
  UI_STRINGS_PAGE_KEY,
  UI_STRINGS_SCHEMA,
  isUiArea,
  type UiArea,
  type UiStringsContent,
  type UiStringsRow,
} from '@/lib/cms/opus-pass-ui-strings'
import UiStringsEditor from './UiStringsEditor'

export const dynamic = 'force-dynamic'

type RouteParams = { area: string }

export default async function SiteUiEditorPage({
  params,
}: {
  params: Promise<RouteParams>
}) {
  const { area } = await params
  if (!isUiArea(area)) notFound()
  const a: UiArea = area

  const supabase = createSupabaseAdminClient()
  const { data: row } = await supabase
    .from('website_page_sections')
    .select('*')
    .eq('page_key', UI_STRINGS_PAGE_KEY[a])
    .eq('section_key', 'copy')
    .maybeSingle<UiStringsRow>()

  const stored = (row?.draft_content ?? row?.content ?? {}) as UiStringsContent
  const initial: UiStringsContent = { ...UI_STRINGS_FALLBACK[a], ...stored }
  const hasDraft = !!row?.draft_content

  return (
    <UiStringsEditor
      area={a}
      label={UI_STRINGS_LABEL[a]}
      groups={UI_STRINGS_SCHEMA[a]}
      initial={initial}
      hasDraft={hasDraft}
    />
  )
}
