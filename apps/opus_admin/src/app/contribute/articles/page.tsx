import Link from 'next/link'
import { currentUser } from '@clerk/nextjs/server'
import { FileText } from 'lucide-react'
import { createSupabaseAdminClient } from '@/lib/supabase'
import {
  ADVICE_SUBMISSION_MISSING_TABLE_HINT,
  isMissingAdviceSubmissionTable,
  statusLabel,
  statusTone,
  type AdviceSubmissionStatus,
} from '@/lib/advice-submissions'

export const dynamic = 'force-dynamic'

type ContributorListRow = {
  id: string
  title: string
  slug: string
  status: AdviceSubmissionStatus
  updated_at: string
}

const COLS = 'id, title, slug, status, updated_at'

export default async function ContributorArticlesPage() {
  const user = await currentUser()
  const email = (
    user?.primaryEmailAddress?.emailAddress ||
    user?.emailAddresses?.[0]?.emailAddress ||
    ''
  ).trim().toLowerCase()

  const supabase = createSupabaseAdminClient()
  // Query the two ownership predicates separately so user-controlled email
  // can't escape into the PostgREST .or() DSL. Merge in JS.
  const [byClerk, byEmail] = await Promise.all([
    user?.id
      ? supabase
          .from('advice_article_submissions')
          .select(COLS)
          .eq('author_clerk_id', user.id)
          .order('updated_at', { ascending: false })
      : Promise.resolve({ data: [], error: null } as const),
    email
      ? supabase
          .from('advice_article_submissions')
          .select(COLS)
          .ilike('author_email', email)
          .order('updated_at', { ascending: false })
      : Promise.resolve({ data: [], error: null } as const),
  ])

  let tableMissing = false
  for (const result of [byClerk, byEmail]) {
    if (!result.error) continue
    if (isMissingAdviceSubmissionTable(result.error)) {
      console.warn(`[contribute] ${result.error.code} — ${ADVICE_SUBMISSION_MISSING_TABLE_HINT}`)
      tableMissing = true
      continue
    }
    throw result.error
  }

  const seen = new Set<string>()
  const submissions: ContributorListRow[] = [
    ...((byClerk.data ?? []) as ContributorListRow[]),
    ...((byEmail.data ?? []) as ContributorListRow[]),
  ].filter((row) => {
    if (seen.has(row.id)) return false
    seen.add(row.id)
    return true
  }).sort((a, b) => (a.updated_at < b.updated_at ? 1 : -1))

  return (
    <div className="mx-auto max-w-[1000px] px-6 py-10">
      <div className="mb-8">
        <h1 className="text-3xl font-semibold tracking-tight text-gray-950">
          Your article drafts
        </h1>
        <p className="mt-2 max-w-2xl text-sm leading-relaxed text-gray-500">
          Draft your assigned Ideas &amp; Advice article here. Once submitted,
          the editorial team can approve it, reject it, or send notes back.
        </p>
        {tableMissing && (
          <div className="mt-4 rounded-xl border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-900">
            <p className="font-semibold">Contributor workflow not set up yet</p>
            <p className="mt-1">
              The site administrator needs to apply the contributor workflow migration. Please ask them to apply <code className="rounded bg-amber-100 px-1">supabase/migrations/20260505000001_advice_article_contributor_workflow.sql</code>.
            </p>
          </div>
        )}
      </div>

      <div className="overflow-hidden rounded-2xl border border-gray-100 bg-white shadow-[0_2px_10px_-4px_rgba(0,0,0,0.05)]">
        {submissions.length === 0 ? (
          <div className="px-6 py-14 text-center">
            <FileText className="mx-auto h-8 w-8 text-gray-300" />
            <p className="mt-3 text-sm font-medium text-gray-700">No drafts yet</p>
            <p className="mt-1 text-sm text-gray-500">
              Open your contributor invite link to create your first draft.
            </p>
          </div>
        ) : (
          <ul className="divide-y divide-gray-100">
            {submissions.map((submission) => (
              <li key={submission.id}>
                <Link
                  href={`/contribute/articles/${submission.id}`}
                  className="flex items-center justify-between gap-4 px-5 py-4 transition-colors hover:bg-gray-50"
                >
                  <div className="min-w-0">
                    <p className="truncate font-semibold text-gray-950">
                      {submission.title || 'Untitled article'}
                    </p>
                    <p className="mt-0.5 truncate text-xs text-gray-500">
                      {submission.slug ? `/advice-and-ideas/${submission.slug}` : 'No slug yet'}
                    </p>
                  </div>
                  <span
                    className={`shrink-0 rounded-full px-2.5 py-1 text-xs font-semibold ${statusTone(submission.status)}`}
                  >
                    {statusLabel(submission.status)}
                  </span>
                </Link>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  )
}
