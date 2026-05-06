// OF-ADM-EDITORIAL-001 — single article row. Title + meta share one column
// so long titles can use the full width; the meta line below carries
// category, author, date, and stats as middot-separated text. Status pill +
// kebab placeholder live in their own narrow columns so the row scans
// cleanly.

import Link from 'next/link'
import StatusPill from '../../_shared/StatusPill'
import { categoryLabel } from '../../_shared/CategoryBadge'
import { formatRelativeTime } from '../../_shared/relativeTime'
import ArticleThumbnail from './ArticleThumbnail'
import PostsTableActions from '../PostsTableActions'

export type ArticleListEntry = {
  id: string
  slug: string
  title: string
  category: string
  authorName: string | null
  publishedAt: string
  updatedAt: string
  readTime: number
  published: boolean
  heroSrc: string | null
  heroAlt: string | null
  heroType: 'image' | 'video'
}

function metaLine(entry: ArticleListEntry): string {
  const parts: string[] = [categoryLabel(entry.category)]
  if (entry.authorName) parts.push(`by ${entry.authorName}`)
  if (entry.published) {
    parts.push(formatRelativeTime(entry.publishedAt))
    parts.push(`${entry.readTime} min read`)
  } else {
    parts.push(`last edited ${formatRelativeTime(entry.updatedAt)}`)
  }
  return parts.join(' · ')
}

export default function ArticleRow({ entry }: { entry: ArticleListEntry }) {
  return (
    <div
      role="row"
      className="grid grid-cols-[64px_minmax(0,1fr)_120px_120px] items-center gap-3 border-b border-gray-100 bg-white px-4 py-3.5 transition-colors hover:bg-gray-50/60"
    >
      <ArticleThumbnail
        category={entry.category}
        heroSrc={entry.heroSrc}
        heroAlt={entry.heroAlt}
        heroType={entry.heroType}
      />

      <div className="min-w-0">
        <Link
          href={`/operations/articles/${entry.id}`}
          className="block truncate text-sm font-semibold text-gray-900 hover:text-[#7E5896]"
          title={entry.title || 'Untitled'}
        >
          {entry.title || 'Untitled'}
        </Link>
        <p className="mt-0.5 truncate text-xs text-gray-500" title={metaLine(entry)}>
          {metaLine(entry)}
        </p>
      </div>

      <div role="cell" className="flex items-center">
        <StatusPill variant={entry.published ? 'published' : 'draft'} />
      </div>

      <div role="cell" className="flex items-center justify-end">
        <PostsTableActions
          id={entry.id}
          slug={entry.slug}
          published={entry.published}
        />
      </div>
    </div>
  )
}
