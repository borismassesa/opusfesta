// Front-page curation under Website CMS → Advice & Ideas.
//
// This sits alongside the Hero / Topics / Section Headers config in the
// same sidebar — they all answer "how does the public /advice-and-ideas
// page look?" Front-page curation is the editor-picks ordering for that
// page; mutating `advice_ideas_posts.featured` + `featured_rank`.
//
// Article CRUD (write, edit, publish, delete) still lives under
// Operations → Articles. This page is just the read/pick view that
// composes the public front.

import { createSupabaseAdminClient } from '@/lib/supabase'
import FrontPageEditor, { type FrontPageArticle } from './FrontPageEditor'

export const dynamic = 'force-dynamic'

const FRONT_PAGE_SLOTS = 5

export default async function AdviceFrontPageCurationPage() {
  const supabase = createSupabaseAdminClient()
  // Editorial volume is small (dozens), so we load every published
  // article and filter client-side for the "Add article" picker. Order
  // by featured_rank so the pinned set is already in slot order.
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

  return <FrontPageEditor articles={articles} maxSlots={FRONT_PAGE_SLOTS} />
}
