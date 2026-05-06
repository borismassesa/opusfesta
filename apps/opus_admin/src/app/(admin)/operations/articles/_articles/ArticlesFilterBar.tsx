// OF-ADM-EDITORIAL-001 — Articles filter strip. Mirrors the Submissions /
// Authors filter bar so the three editorial tabs share one visual grammar.
// Search slot leads the row, filters follow, Sort is right-pinned via
// `ml-auto` — keeps Sort beside the filters on a single line at typical
// admin widths, drops to its own row only on truly narrow viewports.

'use client'

import type { ReactNode } from 'react'
import { COMPACT_SELECT_CLS } from '../../_shared/filterControls'

export type ArticleStatusFilter = 'all' | 'published' | 'draft'
export type ArticleSort = 'newest' | 'oldest' | 'recently_edited'

type Props = {
  statusFilter: ArticleStatusFilter
  categories: string[]
  categoryFilter: string | null
  authors: string[]
  authorFilter: string | null
  sort: ArticleSort
  onStatusChange: (next: ArticleStatusFilter) => void
  onCategoryChange: (next: string | null) => void
  onAuthorChange: (next: string | null) => void
  onSortChange: (next: ArticleSort) => void
  searchSlot?: ReactNode
}

export default function ArticlesFilterBar({
  statusFilter,
  categories,
  categoryFilter,
  authors,
  authorFilter,
  sort,
  onStatusChange,
  onCategoryChange,
  onAuthorChange,
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
        onChange={(e) => onStatusChange(e.target.value as ArticleStatusFilter)}
        className={COMPACT_SELECT_CLS}
        aria-label="Filter by status"
      >
        <option value="all">Status: All</option>
        <option value="published">Published</option>
        <option value="draft">Draft</option>
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
        value={sort}
        onChange={(e) => onSortChange(e.target.value as ArticleSort)}
        className={`${COMPACT_SELECT_CLS} ml-auto`}
        aria-label="Sort"
      >
        <option value="newest">Sort: Newest</option>
        <option value="oldest">Sort: Oldest</option>
        <option value="recently_edited">Sort: Recently edited</option>
      </select>
    </div>
  )
}
