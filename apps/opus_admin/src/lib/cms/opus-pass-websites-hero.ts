import type { MaybeLocalized } from '@/lib/cms/localized'

// Mirrors the public LandingHeroContent — the /websites hero renders the shared
// centred sparkle hero (trust badge + press strip), not the old two-column banner.
export type OpusPassWebsitesHeroContent = {
  // Translatable text — stored as { en, sw } (or a legacy plain string).
  headline_line_1: MaybeLocalized
  headline_line_2: MaybeLocalized
  description: MaybeLocalized
  primary_cta_label: MaybeLocalized
  secondary_cta_label: MaybeLocalized
  // Non-translatable config.
  primary_cta_href: string
  secondary_cta_href: string
  /** Trust badge — star rating (e.g. "4.5") and couple count (e.g. "1000+"). */
  rating: string
  trust_count: string
  /** Avatar cluster shown beside the rating. Empty = built-in couple photos. */
  avatars: string[]
  /** "As featured in" press wordmarks. Empty = built-in press list. */
  featured_in: string[]
}

export type OpusPassWebsitesHeroRow = {
  id: string
  page_key: string
  section_key: string
  content: OpusPassWebsitesHeroContent
  draft_content: OpusPassWebsitesHeroContent | null
  is_published: boolean
  updated_at: string
}

export const OPUS_PASS_WEBSITES_HERO_FALLBACK: OpusPassWebsitesHeroContent = {
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
