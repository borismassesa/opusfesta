import { draftMode } from 'next/headers'
import { createSupabaseServerClient } from '@/lib/supabase'
import { DEFAULT_LOCALE, resolveLocalized, type Locale, type MaybeLocalized } from './localized'

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
  primary_cta_href: '/website-builder',
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

// Stored shape: translatable fields may be a localized { en, sw } object or a
// legacy plain string; non-text fields are scalar. The loader resolves each
// translatable field for `locale` and returns the flat WebsitesHeroContent the
// render components already expect — so no public component changes.
type StoredWebsitesHero = {
  headline_line_1?: MaybeLocalized
  headline_line_2?: MaybeLocalized
  description?: MaybeLocalized
  primary_cta_label?: MaybeLocalized
  secondary_cta_label?: MaybeLocalized
  primary_cta_href?: string
  secondary_cta_href?: string
  rating?: string
  trust_count?: string
  avatars?: string[]
  featured_in?: string[]
}

export async function loadWebsitesHeroContent(
  locale: Locale = DEFAULT_LOCALE
): Promise<WebsitesHeroContent> {
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
      | StoredWebsitesHero
      | undefined
    if (stored) {
      const F = WEBSITES_HERO_FALLBACK
      return {
        headline_line_1: resolveLocalized(stored.headline_line_1 ?? F.headline_line_1, locale),
        headline_line_2: resolveLocalized(stored.headline_line_2 ?? F.headline_line_2, locale),
        description: resolveLocalized(stored.description ?? F.description, locale),
        primary_cta_label: resolveLocalized(stored.primary_cta_label ?? F.primary_cta_label, locale),
        // The primary CTA always opens the website builder. Hardcoded so it can
        // never be overridden by a stale stored CMS value (e.g. legacy `/sign-up`,
        // which bounced signed-in couples to /my/dashboard).
        primary_cta_href: '/website-builder',
        secondary_cta_label: resolveLocalized(stored.secondary_cta_label ?? F.secondary_cta_label, locale),
        secondary_cta_href: stored.secondary_cta_href ?? F.secondary_cta_href,
        rating: stored.rating ?? F.rating,
        trust_count: stored.trust_count ?? F.trust_count,
        avatars:
          stored.avatars && Array.isArray(stored.avatars) ? stored.avatars : F.avatars,
        featured_in:
          stored.featured_in && Array.isArray(stored.featured_in)
            ? stored.featured_in
            : F.featured_in,
      }
    }
    return WEBSITES_HERO_FALLBACK
  } catch (err) {
    console.error('[opus-pass cms] websites-hero load failed', err)
    return WEBSITES_HERO_FALLBACK
  }
}
