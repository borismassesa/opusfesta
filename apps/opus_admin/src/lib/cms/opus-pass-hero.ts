export type OpusPassHeroContent = {
  headline_line_1: string
  headline_line_2: string
  description: string
  primary_cta_label: string
  primary_cta_href: string
  secondary_cta_label: string
  secondary_cta_href: string
  trust_count: string
  rating: string
  avatars: string[]
  featured_in: string[]
}

export type OpusPassHeroRow = {
  id: string
  page_key: string
  section_key: string
  content: OpusPassHeroContent
  draft_content: OpusPassHeroContent | null
  is_published: boolean
  updated_at: string
}

export const OPUS_PASS_HERO_FALLBACK: OpusPassHeroContent = {
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
