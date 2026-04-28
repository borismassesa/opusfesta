import { notFound } from 'next/navigation'
import { createSupabaseAdminClient } from '@/lib/supabase'
import type { AdviceIdeasAuthorRow, AdviceIdeasPostRow } from '@/lib/cms/advice-ideas'
import PostEditor from '../PostEditor'
import type { PostUpsertInput } from '../actions'

export const dynamic = 'force-dynamic'

export default async function EditAdvicePostPage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const { id } = await params

  const supabase = createSupabaseAdminClient()
  const [{ data, error }, { data: authorsData }] = await Promise.all([
    supabase
      .from('advice_ideas_posts')
      .select('*')
      .eq('id', id)
      .maybeSingle<AdviceIdeasPostRow>(),
    supabase
      .from('advice_ideas_authors')
      .select('*')
      .order('sort_order', { ascending: true })
      .order('name', { ascending: true }),
  ])
  if (error) throw error
  if (!data) notFound()
  const authors = (authorsData ?? []) as AdviceIdeasAuthorRow[]

  const initial: PostUpsertInput = {
    id: data.id,
    slug: data.slug,
    title: data.title,
    description: data.description ?? '',
    excerpt: data.excerpt ?? '',
    category: data.category,
    section_id: data.section_id,
    author_name: data.author_name ?? '',
    author_role: data.author_role ?? '',
    author_avatar_url: data.author_avatar_url ?? '',
    read_time: data.read_time ?? 5,
    featured: !!data.featured,
    published: !!data.published,
    published_at: data.published_at,
    hero_media_type: data.hero_media_type,
    hero_media_src: data.hero_media_src,
    hero_media_alt: data.hero_media_alt,
    hero_media_poster: data.hero_media_poster ?? '',
    body: Array.isArray(data.body) ? data.body : [],
    seed_comments: Array.isArray(data.seed_comments) ? data.seed_comments : [],
  }

  return <PostEditor mode="edit" id={id} initial={initial} authors={authors} />
}
