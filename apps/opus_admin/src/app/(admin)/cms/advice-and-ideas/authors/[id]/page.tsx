import { notFound } from 'next/navigation'
import { createSupabaseAdminClient } from '@/lib/supabase'
import type { AdviceIdeasAuthorRow } from '@/lib/cms/advice-ideas'
import AuthorEditor from '../AuthorEditor'
import type { AuthorUpsertInput } from '../actions'

export const dynamic = 'force-dynamic'

export default async function EditAuthorPage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const { id } = await params
  const supabase = createSupabaseAdminClient()
  const { data, error } = await supabase
    .from('advice_ideas_authors')
    .select('*')
    .eq('id', id)
    .maybeSingle<AdviceIdeasAuthorRow>()
  if (error) throw error
  if (!data) notFound()

  const initial: AuthorUpsertInput = {
    id: data.id,
    key: data.key,
    name: data.name,
    role: data.role,
    bio: data.bio,
    initials: data.initials,
    avatar_url: data.avatar_url ?? '',
    sort_order: data.sort_order,
  }

  return <AuthorEditor mode="edit" initial={initial} />
}
