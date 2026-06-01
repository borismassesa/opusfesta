import { draftMode } from 'next/headers'
import { createSupabaseServerClient } from '@/lib/supabase'

export type HomepageHeroContent = {
  headline_line_1: string
  headline_line_2: string
  description: string
  primary_cta_label: string
  primary_cta_href: string
  secondary_cta_label: string
  secondary_cta_href: string
  // New design (shared LandingHero): trust badge + "As featured in" press strip.
  trust_count: string
  rating: string
  avatars: string[]
  featured_in: string[]
}

export const HOMEPAGE_HERO_FALLBACK: HomepageHeroContent = {
  headline_line_1: 'Your whole wedding day',
  headline_line_2: 'one beautiful pass',
  description:
    'Digital invitations, live RSVP tracking, and a beautiful wedding website — all in one pass. Free to start, bilingual in Swahili and English, and built for couples in Tanzania.',
  primary_cta_label: 'Get started',
  primary_cta_href: '/sign-up',
  secondary_cta_label: 'Browse invitations',
  secondary_cta_href: '/invitations',
  trust_count: '1000+',
  rating: '4.5',
  avatars: [
    '/assets/images/cutesy_couple.jpg',
    '/assets/images/churchcouples.jpg',
    '/assets/images/coupleswithpiano.jpg',
    '/assets/images/authentic_couple.jpg',
    '/assets/images/mauzo_crew.jpg',
  ],
  featured_in: ['The Citizen', 'Clouds FM', 'Bongo5', 'JamiiForums'],
}

export async function loadHomepageHeroContent(): Promise<HomepageHeroContent> {
  if (!process.env.NEXT_PUBLIC_SUPABASE_URL || !process.env.SUPABASE_SERVICE_ROLE_KEY) {
    return HOMEPAGE_HERO_FALLBACK
  }
  try {
    const { isEnabled: isDraft } = await draftMode()
    const supabase = createSupabaseServerClient()
    const { data } = await supabase
      .from('website_page_sections')
      .select('content, draft_content')
      .eq('page_key', 'opus-pass-homepage')
      .eq('section_key', 'hero')
      .maybeSingle()
    const stored = (isDraft ? data?.draft_content ?? data?.content : data?.content) as
      | Partial<HomepageHeroContent>
      | undefined
    if (stored) {
      // Map fields explicitly (not a blind spread) so legacy keys from older
      // schemas — main_image_url, card_* from the old two-card hero — never leak
      // into the rendered payload.
      const F = HOMEPAGE_HERO_FALLBACK
      return {
        headline_line_1: stored.headline_line_1 ?? F.headline_line_1,
        headline_line_2: stored.headline_line_2 ?? F.headline_line_2,
        description: stored.description ?? F.description,
        primary_cta_label: stored.primary_cta_label ?? F.primary_cta_label,
        primary_cta_href: stored.primary_cta_href ?? F.primary_cta_href,
        secondary_cta_label: stored.secondary_cta_label ?? F.secondary_cta_label,
        secondary_cta_href: stored.secondary_cta_href ?? F.secondary_cta_href,
        trust_count: stored.trust_count ?? F.trust_count,
        rating: stored.rating ?? F.rating,
        avatars:
          stored.avatars && Array.isArray(stored.avatars) && stored.avatars.length > 0
            ? stored.avatars
            : F.avatars,
        featured_in:
          stored.featured_in && Array.isArray(stored.featured_in) && stored.featured_in.length > 0
            ? stored.featured_in
            : F.featured_in,
      }
    }
    return HOMEPAGE_HERO_FALLBACK
  } catch (err) {
    console.error('[opus-pass cms] homepage-hero load failed', err)
    return HOMEPAGE_HERO_FALLBACK
  }
}
