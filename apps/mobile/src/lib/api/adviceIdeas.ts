import type { SupabaseClient } from '@supabase/supabase-js';

const ADVICE_IDEAS_WEBSITE_ORIGIN = 'https://opusfesta.com';

/** Resolves a hero image to an absolute URL — website content stores site-relative paths. */
export function resolveAdviceIdeasImage(src: string | null | undefined): string | null {
  if (!src) return null;
  if (src.startsWith('http://') || src.startsWith('https://')) return src;
  return `${ADVICE_IDEAS_WEBSITE_ORIGIN}${src.startsWith('/') ? '' : '/'}${src}`;
}

export async function getAdviceIdeas(client: SupabaseClient) {
  const { data, error } = await client
    .from('advice_ideas_posts')
    .select('id, slug, title, description, category, read_time, published_at, hero_media_src, hero_media_alt')
    .eq('published', true)
    .order('published_at', { ascending: false })
    .limit(10);

  if (error) throw error;
  return data ?? [];
}
