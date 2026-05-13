// Front-page curation. Lets editors pick which articles appear in the
// public `/advice-and-ideas` Editor Picks row and in what order. The
// page is a server component that loads the candidate set; the actual
// drag-to-reorder UI lives in FrontPageEditor (client).
//
// "Pinned" = articles with featured_rank set (slot 1..5).
// "Pool"   = articles with featured=true and rank=null. They fill in
//            from the top when fewer than 5 slots are pinned, but the
//            order between them on the public site is published_at DESC.

import Link from 'next/link'
import { ArrowLeft } from 'lucide-react'
import { createSupabaseAdminClient } from '@/lib/supabase'
import { HeaderActionsSlot } from '@/components/HeaderPortals'
import ArticleNavTabs from '../ArticleNavTabs'
import SetArticlesHeading from '../SetArticlesHeading'
import FrontPageEditor, { type FrontPageArticle } from './FrontPageEditor'

export const dynamic = 'force-dynamic'

const FRONT_PAGE_SLOTS = 5

export default async function FrontPageCurationPage() {
  const supabase = createSupabaseAdminClient()
  // Pull every published article. Editorial volume is small (dozens
  // total), so client-side filtering for the "add to front" picker is
  // simpler than another round-trip. Order by featured_rank so the
  // pinned set arrives in the right shape for the editor.
  const { data, error } = await supabase
    .from('advice_ideas_posts')
    .select(
      'id, slug, title, category, author_name, published_at, featured, featured_rank, hero_media_src, hero_media_alt, hero_media_type'
    )
    .eq('published', true)
    .order('featured_rank', { ascending: true, nullsFirst: false })
    .order('featured', { ascending: false })
    .order('published_at', { ascending: false })

  if (error) throw error

  const articles: FrontPageArticle[] = (data ?? []).map((row) => ({
    id: row.id,
    slug: row.slug,
    title: row.title,
    category: row.category,
    authorName: row.author_name,
    publishedAt: row.published_at,
    featured: row.featured,
    featuredRank: row.featured_rank,
    heroSrc: row.hero_media_src || null,
    heroAlt: row.hero_media_alt ?? null,
    heroType: row.hero_media_type,
  }))

  return (
    <div className="pb-12">
      <SetArticlesHeading
        title="Front page"
        subtitle="Pick which articles appear on the public /advice-and-ideas front and in what order."
      />
      <HeaderActionsSlot>
        <Link
          href="/operations/articles"
          className="flex items-center gap-2 rounded-lg border border-gray-200 px-3 py-2 text-sm font-medium text-gray-700 transition-colors hover:bg-gray-50"
        >
          <ArrowLeft className="h-4 w-4" />
          Back to articles
        </Link>
      </HeaderActionsSlot>
      <ArticleNavTabs />
      <div className="mx-auto max-w-[1200px] px-8 pt-8">
        <FrontPageEditor articles={articles} maxSlots={FRONT_PAGE_SLOTS} />
      </div>
    </div>
  )
}
