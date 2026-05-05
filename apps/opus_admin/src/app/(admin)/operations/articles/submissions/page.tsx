import Link from 'next/link'
import { FileText } from 'lucide-react'
import { createSupabaseAdminClient } from '@/lib/supabase'
import {
  ADVICE_SUBMISSION_MISSING_TABLE_HINT,
  isMissingAdviceSubmissionTable,
  statusLabel,
  statusTone,
  type AdviceSubmissionStatus,
} from '@/lib/advice-submissions'
import SetArticlesHeading from '../SetArticlesHeading'

export const dynamic = 'force-dynamic'

type SubmissionListRow = {
  id: string
  title: string
  slug: string
  author_name: string | null
  author_email: string
  status: AdviceSubmissionStatus
  updated_at: string
  submitted_at: string | null
}

export default async function ArticleSubmissionsPage() {
  const supabase = createSupabaseAdminClient()
  const { data, error } = await supabase
    .from('advice_article_submissions')
    .select('id, title, slug, author_name, author_email, status, updated_at, submitted_at')
    .order('submitted_at', { ascending: false, nullsFirst: false })
    .order('updated_at', { ascending: false })

  let tableMissing = false
  if (error) {
    if (isMissingAdviceSubmissionTable(error)) {
      console.warn(`[submissions] ${error.code} — ${ADVICE_SUBMISSION_MISSING_TABLE_HINT}`)
      tableMissing = true
    } else {
      throw error
    }
  }
  const submissions = (data ?? []) as SubmissionListRow[]
  const pendingCount = submissions.filter((s) => s.status === 'submitted').length

  return (
    <div className="px-8 pt-8 pb-12">
      <SetArticlesHeading
        title="Article submissions"
        subtitle={`${pendingCount} awaiting review · ${submissions.length} total`}
      />
      <div className="mx-auto max-w-[1200px] space-y-6">
        {tableMissing && (
          <div className="rounded-xl border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-900">
            <p className="font-semibold">Contributor workflow migration not applied yet</p>
            <p className="mt-1">
              Apply <code className="rounded bg-amber-100 px-1">supabase/migrations/20260505000001_advice_article_contributor_workflow.sql</code> to enable contributor submissions.
            </p>
          </div>
        )}
        <div className="flex flex-wrap items-center justify-between gap-3">
          <p className="max-w-2xl text-sm leading-relaxed text-gray-500">
            Contributor drafts are staged here. Approving copies the submission
            into the live article table; rejecting or requesting corrections
            keeps the contributor flow separate from the admin CMS.
          </p>
          <Link
            href="/operations/articles"
            className="rounded-lg border border-gray-200 px-3 py-2 text-sm font-semibold text-gray-700 hover:bg-gray-50"
          >
            Published articles
          </Link>
        </div>

        <div className="overflow-hidden rounded-2xl border border-gray-100 bg-white shadow-[0_2px_10px_-4px_rgba(0,0,0,0.05)]">
          {submissions.length === 0 ? (
            <div className="px-6 py-14 text-center">
              <FileText className="mx-auto h-8 w-8 text-gray-300" />
              <p className="mt-3 text-sm font-medium text-gray-700">
                No contributor submissions yet
              </p>
            </div>
          ) : (
            <table className="w-full table-fixed text-sm">
              <colgroup>
                <col />
                <col className="w-[190px]" />
                <col className="w-[140px]" />
                <col className="w-[150px]" />
              </colgroup>
              <thead className="bg-gray-50/60 text-left text-[11px] font-bold uppercase tracking-wider text-gray-500">
                <tr>
                  <th className="px-5 py-3.5">Submission</th>
                  <th className="px-5 py-3.5">Contributor</th>
                  <th className="px-5 py-3.5">Status</th>
                  <th className="px-5 py-3.5 text-right">Updated</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {submissions.map((submission) => (
                  <tr key={submission.id} className="align-middle hover:bg-gray-50/60">
                    <td className="px-5 py-4">
                      <Link
                        href={`/operations/articles/submissions/${submission.id}`}
                        className="block min-w-0"
                      >
                        <p className="truncate font-semibold text-gray-950 hover:text-[#7E5896]">
                          {submission.title || 'Untitled article'}
                        </p>
                        <p className="mt-0.5 truncate text-xs text-gray-500">
                          {submission.slug ? `/advice-and-ideas/${submission.slug}` : 'No slug yet'}
                        </p>
                      </Link>
                    </td>
                    <td className="px-5 py-4 text-gray-700">
                      <p className="truncate">{submission.author_name || submission.author_email}</p>
                      <p className="mt-0.5 truncate text-xs text-gray-400">
                        {submission.author_email}
                      </p>
                    </td>
                    <td className="px-5 py-4">
                      <span className={`rounded-full px-2.5 py-1 text-xs font-semibold ${statusTone(submission.status)}`}>
                        {statusLabel(submission.status)}
                      </span>
                    </td>
                    <td className="px-5 py-4 text-right text-xs text-gray-500">
                      {new Date(submission.updated_at).toLocaleDateString()}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </div>
    </div>
  )
}
