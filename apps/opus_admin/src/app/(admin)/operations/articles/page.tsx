// OF-ADM-EDITORIAL-001 — Articles list. Server-fetches the full set of posts
// (the editorial volume is bounded — dozens per month, not thousands) and
// hands the data to ArticlesListView for client-side search + filter +
// sort. Hard URL-state filtering moved to client so the bar stays
// responsive without page reloads.

import Link from 'next/link'
import { Plus } from 'lucide-react'
import { createSupabaseAdminClient } from '@/lib/supabase'
import { type AdviceIdeasPostRow } from '@/lib/cms/advice-ideas'
import { HeaderActionsSlot } from '@/components/HeaderPortals'
import ArticleNavTabs from './ArticleNavTabs'
import SetArticlesHeading from './SetArticlesHeading'
import ArticlesListView from './_articles/ArticlesListView'
import type { ArticleListEntry } from './_articles/ArticleRow'

export const dynamic = 'force-dynamic'

export default async function AdvicePostsListPage() {
  const supabase = createSupabaseAdminClient()
  const { data, error } = await supabase
    .from('advice_ideas_posts')
    .select(
      'id, slug, title, category, section_id, published, published_at, read_time, hero_media_type, hero_media_src, hero_media_alt, author_name, updated_at'
    )
    .order('featured', { ascending: false })
    .order('published_at', { ascending: false })

  if (error) throw error

  const posts = (data ?? []) as Array<
    Pick<
      AdviceIdeasPostRow,
      | 'id'
      | 'slug'
      | 'title'
      | 'category'
      | 'section_id'
      | 'published'
      | 'published_at'
      | 'read_time'
      | 'hero_media_type'
      | 'hero_media_src'
      | 'hero_media_alt'
      | 'author_name'
      | 'updated_at'
    >
  >

  const entries: ArticleListEntry[] = posts.map((p) => ({
    id: p.id,
    slug: p.slug,
    title: p.title,
    category: p.category,
    authorName: p.author_name,
    publishedAt: p.published_at,
    updatedAt: p.updated_at,
    readTime: p.read_time,
    published: p.published,
    heroSrc: p.hero_media_src || null,
    heroAlt: p.hero_media_alt ?? null,
    heroType: p.hero_media_type,
  }))

  const publishedCount = entries.filter((e) => e.published).length
  const draftCount = entries.length - publishedCount
  const subtitle =
    entries.length === 0
      ? 'No articles yet'
      : `${publishedCount} published · ${draftCount} draft${draftCount === 1 ? '' : 's'}`

  return (
    <div className="pb-12">
      <SetArticlesHeading title="Articles" subtitle={subtitle} />
      <HeaderActionsSlot>
        <Link
          href="/operations/articles/submissions"
          className="flex items-center gap-2 text-sm font-semibold text-gray-700 border border-gray-200 hover:bg-gray-50 px-4 py-2 rounded-lg transition-colors"
        >
          Submissions
        </Link>
        <Link
          href="/operations/articles/new"
          className="flex items-center gap-2 rounded-lg bg-[#C9A0DC] px-4 py-2 text-sm font-semibold text-white shadow-sm transition-colors hover:bg-[#b97fd0]"
        >
          <Plus className="h-4 w-4" />
          New article
        </Link>
      </HeaderActionsSlot>
      <ArticleNavTabs />
      <div className="mx-auto max-w-[1200px] px-8 pt-8">
        <ArticlesListView articles={entries} />
      </div>
    </div>
  )
}
