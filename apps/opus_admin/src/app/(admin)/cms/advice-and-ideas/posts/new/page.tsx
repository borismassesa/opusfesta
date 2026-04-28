import { createSupabaseAdminClient } from '@/lib/supabase'
import { EMPTY_POST_DRAFT, type AdviceIdeasAuthorRow } from '@/lib/cms/advice-ideas'
import PostEditor from '../PostEditor'

export const dynamic = 'force-dynamic'

export default async function NewAdvicePostPage() {
  const supabase = createSupabaseAdminClient()
  const { data: authors } = await supabase
    .from('advice_ideas_authors')
    .select('*')
    .order('sort_order', { ascending: true })
    .order('name', { ascending: true })

  return (
    <PostEditor
      mode="create"
      initial={EMPTY_POST_DRAFT()}
      authors={(authors ?? []) as AdviceIdeasAuthorRow[]}
    />
  )
}
