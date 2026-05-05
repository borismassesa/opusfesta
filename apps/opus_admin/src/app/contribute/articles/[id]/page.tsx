import Link from 'next/link'
import { notFound } from 'next/navigation'
import { currentUser } from '@clerk/nextjs/server'
import { ArrowLeft, Lock } from 'lucide-react'
import { createSupabaseAdminClient } from '@/lib/supabase'
import {
  statusLabel,
  statusTone,
  submissionToDraft,
  type AdviceArticleSubmissionRow,
} from '@/lib/advice-submissions'
import PostEditor from '@/app/(admin)/operations/articles/PostEditor'

export const dynamic = 'force-dynamic'

export default async function ContributorArticlePage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const { id } = await params
  const user = await currentUser()
  const email = (
    user?.primaryEmailAddress?.emailAddress ||
    user?.emailAddresses?.[0]?.emailAddress ||
    ''
  ).trim().toLowerCase()

  const supabase = createSupabaseAdminClient()
  const { data, error } = await supabase
    .from('advice_article_submissions')
    .select('*')
    .eq('id', id)
    .maybeSingle<AdviceArticleSubmissionRow>()

  if (error) throw error
  if (!data) notFound()
  if (data.author_clerk_id !== user?.id && data.author_email.toLowerCase() !== email) {
    notFound()
  }

  const editable = data.status === 'draft' || data.status === 'changes_requested'
  if (!editable) {
    return <LockedSubmission submission={data} />
  }

  return (
    <PostEditor
      mode="edit"
      id={id}
      initial={submissionToDraft(data)}
      workflow="contributor-submission"
      submissionStatus={data.status}
      correctionNotes={data.correction_notes}
      backHref="/contribute/articles"
      backLabel="Your drafts"
    />
  )
}

function LockedSubmission({ submission }: { submission: AdviceArticleSubmissionRow }) {
  return (
    <div className="mx-auto max-w-[860px] px-6 py-12">
      <Link
        href="/contribute/articles"
        className="mb-6 inline-flex items-center gap-1.5 text-sm font-medium text-gray-600 hover:text-gray-900"
      >
        <ArrowLeft className="h-4 w-4" />
        Your drafts
      </Link>
      <div className="rounded-2xl border border-gray-100 bg-white p-8 shadow-[0_2px_10px_-4px_rgba(0,0,0,0.05)]">
        <div className="mb-5 inline-flex h-11 w-11 items-center justify-center rounded-full bg-gray-100 text-gray-600">
          <Lock className="h-5 w-5" />
        </div>
        <div className="flex flex-wrap items-center gap-3">
          <h1 className="text-2xl font-semibold tracking-tight text-gray-950">
            {submission.title || 'Article submission'}
          </h1>
          <span className={`rounded-full px-2.5 py-1 text-xs font-semibold ${statusTone(submission.status)}`}>
            {statusLabel(submission.status)}
          </span>
        </div>
        <p className="mt-3 max-w-2xl text-sm leading-relaxed text-gray-500">
          This draft is locked while the editorial team reviews it. If changes
          are requested, it will reopen here with notes.
        </p>
        {submission.correction_notes && (
          <div className="mt-5 rounded-xl border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-900">
            <p className="font-semibold">Correction request</p>
            <p className="mt-1">{submission.correction_notes}</p>
          </div>
        )}
      </div>
    </div>
  )
}
