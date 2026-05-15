// OF-ADM-EDITORIAL-001 — Submissions queue. Subtitle includes a "guilt clock"
// (oldest waiting N days) so editors feel the queue pressure from the
// header alone. Header CTA routes to the oldest pending submission so
// "Review next →" is one click — no hunting through the list.

import Link from 'next/link'
import { ArrowRight, CheckCircle2 } from 'lucide-react'
import { createSupabaseAdminClient } from '@/lib/supabase'
import { type AdviceArticleSubmissionRow } from '@/lib/advice-submissions'
import { HeaderActionsSlot } from '@/components/HeaderPortals'
import SetArticlesHeading from '../SetArticlesHeading'
import ArticleNavTabs from '../ArticleNavTabs'
import SubmissionsListView from './_submissions/SubmissionsListView'
import type { SubmissionListEntry } from './_submissions/SubmissionRow'
import { cn } from '@/lib/utils'

export const dynamic = 'force-dynamic'

// Statuses we surface to admins. 'draft' rows belong to the contributor
// workspace, not the editorial queue.
const VISIBLE_STATUSES = [
  'pending',
  'submitted',
  'revisions',
  'changes_requested',
  'approved',
  'rejected',
  'published',
] as const

export default async function ArticleSubmissionsPage() {
  const supabase = createSupabaseAdminClient()
  const { data, error } = await supabase
    .from('advice_article_submissions')
    .select('*')
    .in('status', VISIBLE_STATUSES as unknown as string[])
    .order('submitted_at', { ascending: false, nullsFirst: false })
    .order('updated_at', { ascending: false })

  if (error) throw error
  // Hide orphaned "published" submissions: when the linked post in
  // advice_ideas_posts is deleted, the FK is ON DELETE SET NULL — so a row
  // with status='published' and source_post_id=null means the article no
  // longer exists. Keeping it in the queue would falsely advertise a live
  // article and bloat the editor's "Published" filter.
  const rows = ((data ?? []) as AdviceArticleSubmissionRow[]).filter(
    (r) => !(r.status === 'published' && r.source_post_id === null)
  )

  const entries: SubmissionListEntry[] = rows.map((r) => ({
    id: r.id,
    title: r.title,
    category: r.category,
    authorName: r.author_name ?? '',
    authorEmail: r.author_email,
    authorAvatarUrl: r.author_avatar_url ?? null,
    status: r.status as SubmissionListEntry['status'],
    readTime: r.read_time,
    submittedAt: r.submitted_at,
    reviewedAt: r.reviewed_at,
    updatedAt: r.updated_at,
    sourcePostId: r.source_post_id,
  }))

  // Used by the "Review next" CTA in the header — fast-forwards reviewers
  // to the oldest pending submission. Stats themselves don't appear in
  // the subtitle anymore (the table below shows them); we still need the
  // oldest-pending lookup for the CTA href.
  const pending = entries.filter((e) => e.status === 'pending' || e.status === 'submitted')
  const oldestPending = pending
    .slice()
    .sort(
      (a, b) =>
        new Date(a.submittedAt ?? a.updatedAt).getTime() -
        new Date(b.submittedAt ?? b.updatedAt).getTime()
    )[0]

  const reviewNextHref = oldestPending
    ? `/operations/articles/submissions/${oldestPending.id}`
    : null

  return (
    <div className="pb-12">
      <SetArticlesHeading title="Submissions" />
      <HeaderActionsSlot>
        {reviewNextHref ? (
          <Link
            href={reviewNextHref}
            className={cn(
              'inline-flex items-center gap-2 rounded-lg bg-[#C9A0DC] px-4 py-2 text-sm font-semibold text-white shadow-sm transition-colors hover:bg-[#b97fd0]'
            )}
          >
            Review next <ArrowRight className="h-4 w-4" />
          </Link>
        ) : (
          <span className="inline-flex items-center gap-2 rounded-lg border border-emerald-200 bg-emerald-50 px-4 py-2 text-sm font-semibold text-emerald-800">
            <CheckCircle2 className="h-4 w-4" />
            All caught up
          </span>
        )}
      </HeaderActionsSlot>
      <ArticleNavTabs />
      <div className="mx-auto max-w-[1200px] px-8 pt-8">
        <SubmissionsListView
          submissions={entries}
          upNextId={oldestPending?.id ?? null}
        />
      </div>
    </div>
  )
}
