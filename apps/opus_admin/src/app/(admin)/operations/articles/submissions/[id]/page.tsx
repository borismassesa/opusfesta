import { notFound } from 'next/navigation'
import { createSupabaseAdminClient } from '@/lib/supabase'
import {
  submissionToDraft,
  type AdviceArticleSubmissionRow,
} from '@/lib/advice-submissions'
import PostEditor from '../../PostEditor'

export const dynamic = 'force-dynamic'

export default async function ArticleSubmissionReviewPage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const { id } = await params
  const supabase = createSupabaseAdminClient()
  const { data, error } = await supabase
    .from('advice_article_submissions')
    .select('*')
    .eq('id', id)
    .maybeSingle<AdviceArticleSubmissionRow>()

  if (error) throw error
  if (!data) notFound()

  return (
    <PostEditor
      mode="edit"
      id={id}
      initial={submissionToDraft(data)}
      workflow="admin-submission"
      submissionStatus={data.status}
      correctionNotes={data.correction_notes}
      adminNotes={data.admin_notes}
      backHref="/operations/articles/submissions"
      backLabel="Submissions"
    />
  )
}
