import { hasAnyPermission, hasPermission } from '@/lib/admin-auth'
import { createSupabaseAdminClient } from '@/lib/supabase'
import ContentIdeasClient, { type ContentIdea, type ContentIdeaKind } from './ContentIdeasClient'

export const dynamic = 'force-dynamic'

type IdeaRow = {
  id: string
  kind: ContentIdeaKind
  title: string
  description: string
  details: Record<string, string>
  sort_order: number
}

export default async function ContentIdeasPage() {
  const canView = await hasAnyPermission(['growth.write', 'growth.admin'])
  if (!canView) throw new Error("You don't have permission to view the Content Ideas bank.")
  const canAdmin = await hasPermission('growth.admin')

  const supabase = createSupabaseAdminClient()
  const { data, error } = await supabase
    .from('growth_content_ideas')
    .select('id, kind, title, description, details, sort_order')
    .order('kind', { ascending: true })
    .order('sort_order', { ascending: true })
    .returns<IdeaRow[]>()
  if (error) throw new Error(`[growth] content-ideas query failed: ${error.message}`)

  const ideas: ContentIdea[] = (data ?? []).map((r) => ({
    id: r.id,
    kind: r.kind,
    title: r.title,
    description: r.description,
    details: r.details ?? {},
    sortOrder: r.sort_order,
  }))

  return <ContentIdeasClient ideas={ideas} canAdmin={canAdmin} />
}
