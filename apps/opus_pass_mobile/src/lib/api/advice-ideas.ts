import type { SupabaseClient } from '@supabase/supabase-js';
import type {
  AdviceIdeaPost,
  AdviceIdeaPostDetail,
} from '@/types/advice-ideas';

/**
 * Public content table (`"public read published advice ideas posts"` RLS —
 * see supabase/migrations/049_advice_ideas_content.sql), same one the
 * apps/opus_website "Advice & Ideas" pages read from. Queried with the
 * plain (unauthenticated) Supabase client — reading published articles
 * doesn't require a signed-in session.
 */
export async function getAdviceIdeaPosts(
  client: SupabaseClient
): Promise<AdviceIdeaPost[]> {
  const { data, error } = await client
    .from('advice_ideas_posts')
    .select(
      'slug, title, excerpt, category, hero_media_src, read_time, featured'
    )
    .eq('published', true)
    .order('featured', { ascending: false })
    .order('published_at', { ascending: false })
    .limit(10);
  if (error) throw error;

  return ((data ?? []) as AdviceIdeaPost[])
    .filter((post) => post.hero_media_src?.startsWith('http'))
    .map((post) => ({ ...post, title: post.title.trim() }));
}

export async function getAdviceIdeaPostBySlug(
  client: SupabaseClient,
  slug: string
): Promise<AdviceIdeaPostDetail | null> {
  const { data, error } = await client
    .from('advice_ideas_posts')
    .select(
      'slug, title, excerpt, category, hero_media_src, read_time, featured, author_name, author_role, author_avatar_url, body'
    )
    .eq('published', true)
    .eq('slug', slug)
    .maybeSingle();
  if (error) throw error;
  if (!data) return null;

  return {
    ...data,
    title: (data.title as string).trim(),
  } as AdviceIdeaPostDetail;
}
