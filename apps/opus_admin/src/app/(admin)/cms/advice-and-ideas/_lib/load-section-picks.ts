// Server-side loader shared by the Loved by Couples and Our Favorites
// admin pages. Pulls every published article once, partitions into
// "picked for this section" (in slot order) vs "available", and maps
// to the shape the editor component wants.
//
// Editorial volume is small (dozens of articles total), so a single
// query + JS partition is simpler than two filtered queries.

import { createSupabaseAdminClient } from '@/lib/supabase'
import type { SectionArticle } from './SectionPicksEditor'
import type { SectionPickKey } from './section-picks-actions'

export type SectionPicksData = {
  pickedArticles: SectionArticle[]
  availableArticles: SectionArticle[]
}

type PostRow = {
  id: string
  slug: string
  title: string
  category: string
  author_name: string | null
  published_at: string
  hero_media_src: string | null
  hero_media_alt: string | null
  hero_media_type: 'image' | 'video'
}

type PickRow = { post_id: string; rank: number }

export async function loadSectionPicks(
  sectionKey: SectionPickKey,
): Promise<SectionPicksData> {
  const supabase = createSupabaseAdminClient()

  // Two reads in parallel — small, both indexed.
  const [postsRes, picksRes] = await Promise.all([
    supabase
      .from('advice_ideas_posts')
      .select(
        'id, slug, title, category, author_name, published_at, hero_media_src, hero_media_alt, hero_media_type',
      )
      .eq('published', true)
      .order('published_at', { ascending: false }),
    supabase
      .from('advice_ideas_section_picks')
      .select('post_id, rank')
      .eq('section_key', sectionKey)
      .order('rank', { ascending: true }),
  ])

  if (postsRes.error) throw postsRes.error
  if (picksRes.error) throw picksRes.error

  const allPosts = (postsRes.data ?? []) as PostRow[]
  const picks = (picksRes.data ?? []) as PickRow[]

  const byId = new Map<string, PostRow>()
  for (const post of allPosts) byId.set(post.id, post)

  const pickedArticles: SectionArticle[] = picks
    .map((pick) => byId.get(pick.post_id))
    .filter((post): post is PostRow => post != null)
    .map(toSectionArticle)

  const pickedIds = new Set(pickedArticles.map((a) => a.id))
  const availableArticles: SectionArticle[] = allPosts
    .filter((post) => !pickedIds.has(post.id))
    .map(toSectionArticle)

  return { pickedArticles, availableArticles }
}

function toSectionArticle(row: PostRow): SectionArticle {
  return {
    id: row.id,
    slug: row.slug,
    title: row.title,
    category: row.category,
    authorName: row.author_name,
    publishedAt: row.published_at,
    heroSrc: row.hero_media_src || null,
    heroAlt: row.hero_media_alt ?? null,
    heroType: row.hero_media_type,
  }
}
