import Link from 'next/link'
import { ArrowRight } from 'lucide-react'
import StatusPill, { type StatusVariant } from '@/app/(admin)/operations/_shared/StatusPill'
import { formatRelativeTime } from '@/app/(admin)/operations/_shared/relativeTime'
import { displayStatus, type ContributorDraft } from '@/lib/contribute/types'
import { cn } from '@/lib/utils'

const CATEGORY_COLORS: Record<string, string> = {
  'Advice & Ideas': 'bg-[#F0DFF6]',
  'Real Weddings': 'bg-[#FDE8E8]',
  'Planning Guides': 'bg-[#E7F0FF]',
  Style: 'bg-[#F7E7F1]',
  Vendors: 'bg-[#E7F7EF]',
  Etiquette: 'bg-[#FFF4D8]',
}

const PILL: Record<string, StatusVariant> = {
  draft: 'draft',
  revisions: 'revisions',
  changes_requested: 'revisions',
  pending: 'pending',
  submitted: 'pending',
  approved: 'approved',
  published: 'published',
  rejected: 'rejected',
}

export default function DraftRow({
  draft,
  section,
}: {
  draft: ContributorDraft
  section: 'drafts' | 'pending' | 'published'
}) {
  const status = displayStatus(draft.status)
  const href =
    section === 'published' && draft.slug
      ? `/advice-and-ideas/${draft.slug}`
      : `/contribute/drafts/${draft.id}`
  const verb = section === 'published' ? 'View' : 'Open'
  const timeVerb =
    section === 'published'
      ? 'published'
      : section === 'pending'
        ? 'submitted'
        : 'edited'
  const timeIso =
    section === 'pending'
      ? draft.submitted_at ?? draft.updated_at
      : section === 'published'
        ? draft.reviewed_at ?? draft.updated_at
        : draft.updated_at

  return (
    <div
      role="row"
      className="grid grid-cols-[36px_minmax(0,1fr)_110px_86px] items-center gap-3 border-b border-gray-100 bg-white px-4 py-3.5 transition-colors last:border-b-0 hover:bg-gray-50/60 max-sm:grid-cols-[32px_minmax(0,1fr)_72px]"
    >
      <span
        className={cn(
          'flex h-9 w-9 items-center justify-center rounded-full text-xs font-bold text-[#5B2D8E]',
          CATEGORY_COLORS[draft.category] ?? 'bg-gray-100'
        )}
      >
        {draft.category.slice(0, 1)}
      </span>
      <div className="min-w-0">
        <Link
          href={href}
          className="block truncate text-sm font-semibold text-gray-950 hover:text-[#5B2D8E]"
          title={draft.title || 'Untitled draft'}
        >
          {draft.title || 'Untitled draft'}
        </Link>
        <p className="mt-0.5 truncate text-xs text-gray-500">
          {draft.category} · {draft.word_count.toLocaleString()} words · {timeVerb}{' '}
          {formatRelativeTime(timeIso)}
        </p>
      </div>
      <div className="max-sm:hidden">
        <StatusPill variant={PILL[draft.status] ?? 'draft'} label={status === 'pending' ? 'Pending' : undefined} />
      </div>
      <Link
        href={href}
        className="inline-flex items-center justify-end gap-1.5 rounded-lg px-2 py-1.5 text-xs font-semibold text-gray-700 transition-colors hover:bg-gray-100"
      >
        {verb}
        <ArrowRight className="h-3 w-3" />
      </Link>
    </div>
  )
}
