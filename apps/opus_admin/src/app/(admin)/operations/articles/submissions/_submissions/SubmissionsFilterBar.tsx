// OF-ADM-EDITORIAL-001 — submissions filter strip. Same shape as the Articles
// filter bar; the Sort default is Oldest first because submissions are a
// queue, not a feed (newest-first encourages cherry-picking and lets the
// backlog rot).
//
// Layout: search + three filters + sort sit in a single flex row. Sort
// uses `ml-auto` so it stays right-pinned without `justify-between`
// pushing items into a wrap on mid widths. Wrapping is allowed below
// ~640px, where the row has no choice.

'use client'

import type { ReactNode } from 'react'
import { COMPACT_SELECT_CLS } from '../../../_shared/filterControls'

export type SubmissionStatusFilter =
  | 'all'
  | 'pending'
  | 'revisions'
  | 'approved'
  | 'rejected'
export type SubmissionSort = 'oldest' | 'newest' | 'longest'

type Props = {
  statusFilter: SubmissionStatusFilter
  authors: string[]
  authorFilter: string | null
  categories: string[]
  categoryFilter: string | null
  sort: SubmissionSort
  onStatusChange: (next: SubmissionStatusFilter) => void
  onAuthorChange: (next: string | null) => void
  onCategoryChange: (next: string | null) => void
  onSortChange: (next: SubmissionSort) => void
  searchSlot?: ReactNode
}

export default function SubmissionsFilterBar({
  statusFilter,
  authors,
  authorFilter,
  categories,
  categoryFilter,
  sort,
  onStatusChange,
  onAuthorChange,
  onCategoryChange,
  onSortChange,
  searchSlot,
}: Props) {
  return (
    <div className="flex flex-wrap items-center gap-2 py-1">
      {searchSlot && (
        <div className="min-w-[180px] flex-1 sm:max-w-[240px]">{searchSlot}</div>
      )}
      <select
        value={statusFilter}
        onChange={(e) => onStatusChange(e.target.value as SubmissionStatusFilter)}
        className={COMPACT_SELECT_CLS}
        aria-label="Filter by status"
      >
        <option value="all">Status: All</option>
        <option value="pending">Pending</option>
        <option value="revisions">Revisions</option>
        <option value="approved">Approved</option>
        <option value="rejected">Rejected</option>
      </select>
      <select
        value={authorFilter ?? ''}
        onChange={(e) => onAuthorChange(e.target.value || null)}
        className={COMPACT_SELECT_CLS}
        aria-label="Filter by author"
      >
        <option value="">Author: All</option>
        {authors.map((a) => (
          <option key={a} value={a}>
            {a}
          </option>
        ))}
      </select>
      <select
        value={categoryFilter ?? ''}
        onChange={(e) => onCategoryChange(e.target.value || null)}
        className={COMPACT_SELECT_CLS}
        aria-label="Filter by category"
      >
        <option value="">Category: All</option>
        {categories.map((c) => (
          <option key={c} value={c}>
            {c}
          </option>
        ))}
      </select>
      <select
        value={sort}
        onChange={(e) => onSortChange(e.target.value as SubmissionSort)}
        className={`${COMPACT_SELECT_CLS} ml-auto`}
        aria-label="Sort"
      >
        <option value="oldest">Sort: Oldest first</option>
        <option value="newest">Sort: Newest first</option>
        <option value="longest">Sort: Longest read</option>
      </select>
    </div>
  )
}
