import type { SupabaseClient } from '@supabase/supabase-js';

const ADVICE_IDEAS_WEBSITE_ORIGIN = 'https://opusfesta.com';

export interface AdviceIdea {
  id: string;
  slug: string;
  title: string;
  description: string | null;
  category: string | null;
  read_time: string | null;
  published_at: string | null;
  hero_media_src: string | null;
  hero_media_alt: string | null;
}

/** Resolves a hero image to an absolute URL — website content stores site-relative paths. */
export function resolveAdviceIdeasImage(src: string | null | undefined): string | null {
  if (!src) return null;
  if (src.startsWith('http://') || src.startsWith('https://')) return src;
  return `${ADVICE_IDEAS_WEBSITE_ORIGIN}${src.startsWith('/') ? '' : '/'}${src}`;
}

export async function getAdviceIdeas(client: SupabaseClient): Promise<AdviceIdea[]> {
  const { data, error } = await client
    .from('advice_ideas_posts')
    .select('id, slug, title, description, category, read_time, published_at, hero_media_src, hero_media_alt')
    .eq('published', true)
    .order('published_at', { ascending: false })
    .limit(10);

  if (error) throw error;
  return (data ?? []) as AdviceIdea[];
}
