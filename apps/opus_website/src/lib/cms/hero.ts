import { createSupabaseServerClient } from '@/lib/supabase'

export type HeroContent = {
  headline_line_1: string
  headline_line_2: string
  headline_line_3: string
  subheadline: string
  primary_cta_label: string
  primary_cta_href: string
  secondary_cta_label: string
  secondary_cta_href: string
  media_type: 'video' | 'image'
  media_url: string
}

export const HERO_FALLBACK: HeroContent = {
  headline_line_1: 'Everything You Need',
  headline_line_2: 'To Plan Your Wedding',
  headline_line_3: 'All In One Place.',
  subheadline:
    'Make your wedding planning effortless. Discover venues, connect with vendors, and manage your registry. All from one easy-to-use platform.',
  primary_cta_label: 'Start planning',
  primary_cta_href: '#',
  secondary_cta_label: 'Find vendors',
  secondary_cta_href: '/vendors',
  media_type: 'video',
  media_url: '/assets/videos/couple_.mp4',
}

export async function loadHeroContent(): Promise<HeroContent> {
  if (!process.env.NEXT_PUBLIC_SUPABASE_URL || !process.env.SUPABASE_SERVICE_ROLE_KEY) {
    return HERO_FALLBACK
  }
  try {
    const supabase = createSupabaseServerClient()
    const { data } = await supabase
      .from('website_page_sections')
      .select('content')
      .eq('page_key', 'home')
      .eq('section_key', 'hero')
      .maybeSingle()
    const stored = data?.content as Partial<HeroContent> | undefined
    // If the row exists, fill TRULY-missing fields with empty strings (not
    // fallback values) — otherwise an older row missing headline_line_3 would
    // pick up the fallback's line 3 and duplicate content.
    if (stored) {
      return {
        headline_line_1: stored.headline_line_1 ?? '',
        headline_line_2: stored.headline_line_2 ?? '',
        headline_line_3: stored.headline_line_3 ?? '',
        subheadline: stored.subheadline ?? '',
        primary_cta_label: stored.primary_cta_label ?? '',
        primary_cta_href: stored.primary_cta_href ?? '',
        secondary_cta_label: stored.secondary_cta_label ?? '',
        secondary_cta_href: stored.secondary_cta_href ?? '',
        media_type: stored.media_type ?? 'video',
        media_url: stored.media_url ?? '',
      }
    }
    return HERO_FALLBACK
  } catch {
    return HERO_FALLBACK
  }
}
