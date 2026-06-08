import { draftMode } from 'next/headers'
import { createSupabaseServerClient } from '@/lib/supabase'

// Mirrors LandingHeroContent (components/LandingHero) — the /websites hero now
// renders the shared centred sparkle hero, not the old two-column banner.
export type WebsitesHeroContent = {
  headline_line_1: string
  headline_line_2: string
  description: string
  primary_cta_label: string
  primary_cta_href: string
  secondary_cta_label: string
  secondary_cta_href: string
  /** Trust badge — star rating (e.g. "4.5") and couple count (e.g. "1000+"). */
  rating: string
  trust_count: string
  /** Avatar cluster shown beside the rating. Empty = built-in couple photos. */
  avatars: string[]
  /** "As featured in" press wordmarks. Empty = built-in press list. */
  featured_in: string[]
}

export const WEBSITES_HERO_FALLBACK: WebsitesHeroContent = {
  headline_line_1: 'Create your wedding website',
  headline_line_2: 'in just minutes',
  description:
    "Build a beautiful wedding website to share details, collect RSVPs and link your registry — all in one place. Free with every OpusPass, bilingual in Swahili and English.",
  primary_cta_label: 'Start your website',
  primary_cta_href: '/sign-up',
  secondary_cta_label: 'Explore designs',
  secondary_cta_href: '#designs',
  rating: '4.5',
  trust_count: '1000+',
  avatars: [
    '/assets/images/cutesy_couple.jpg',
    '/assets/images/churchcouples.jpg',
    '/assets/images/coupleswithpiano.jpg',
    '/assets/images/authentic_couple.jpg',
    '/assets/images/mauzo_crew.jpg',
  ],
  featured_in: ['The Citizen', 'Clouds FM', 'Bongo5', 'JamiiForums'],
}

export async function loadWebsitesHeroContent(): Promise<WebsitesHeroContent> {
  if (!process.env.NEXT_PUBLIC_SUPABASE_URL || !process.env.SUPABASE_SERVICE_ROLE_KEY) {
    return WEBSITES_HERO_FALLBACK
  }
  try {
    const { isEnabled: isDraft } = await draftMode()
    const supabase = createSupabaseServerClient()
    const { data } = await supabase
      .from('website_page_sections')
      .select('content, draft_content')
      .eq('page_key', 'opus-pass-websites')
      .eq('section_key', 'hero')
      .maybeSingle()
    const stored = (isDraft ? data?.draft_content ?? data?.content : data?.content) as
      | Partial<WebsitesHeroContent>
      | undefined
    if (stored) {
      return {
        headline_line_1: stored.headline_line_1 ?? WEBSITES_HERO_FALLBACK.headline_line_1,
        headline_line_2: stored.headline_line_2 ?? WEBSITES_HERO_FALLBACK.headline_line_2,
        description: stored.description ?? WEBSITES_HERO_FALLBACK.description,
        primary_cta_label: stored.primary_cta_label ?? WEBSITES_HERO_FALLBACK.primary_cta_label,
        primary_cta_href: stored.primary_cta_href ?? WEBSITES_HERO_FALLBACK.primary_cta_href,
        secondary_cta_label: stored.secondary_cta_label ?? WEBSITES_HERO_FALLBACK.secondary_cta_label,
        secondary_cta_href: stored.secondary_cta_href ?? WEBSITES_HERO_FALLBACK.secondary_cta_href,
        rating: stored.rating ?? WEBSITES_HERO_FALLBACK.rating,
        trust_count: stored.trust_count ?? WEBSITES_HERO_FALLBACK.trust_count,
        avatars:
          stored.avatars && Array.isArray(stored.avatars) ? stored.avatars : WEBSITES_HERO_FALLBACK.avatars,
        featured_in:
          stored.featured_in && Array.isArray(stored.featured_in)
            ? stored.featured_in
            : WEBSITES_HERO_FALLBACK.featured_in,
      }
    }
    return WEBSITES_HERO_FALLBACK
  } catch (err) {
    console.error('[opus-pass cms] websites-hero load failed', err)
    return WEBSITES_HERO_FALLBACK
  }
}
