/** One circular "wedding moment" chip in the morph-hero suite strip. */
export type OpusPassInvitationsHeroSuiteCategory = {
  id: string
  label: string
  /** Screen-reader alt text for the chip image. */
  alt: string
  /** Image URL — an uploaded asset URL or a local `/assets/...` path. */
  image: string
}

export type OpusPassInvitationsHeroContent = {
  /** Lead line shown over the morphing card ring before it hands off. */
  intro_headline: string
  primary_cta_label: string
  primary_cta_href: string
  secondary_cta_label: string
  secondary_cta_href: string
  /** Heading for the suite strip revealed once the cards settle. */
  suite_heading: string
  suite_body: string
  suite_categories: OpusPassInvitationsHeroSuiteCategory[]
}

export type OpusPassInvitationsHeroRow = {
  id: string
  page_key: string
  section_key: string
  content: OpusPassInvitationsHeroContent
  draft_content: OpusPassInvitationsHeroContent | null
  is_published: boolean
  updated_at: string
}

export const OPUS_PASS_INVITATIONS_HERO_FALLBACK: OpusPassInvitationsHeroContent = {
  intro_headline: 'Invitations for every celebration.',
  primary_cta_label: 'Browse designs',
  primary_cta_href: '/invitations/catalog',
  secondary_cta_label: 'Get started free',
  secondary_cta_href: '/sign-up',
  suite_heading: 'Invitations for Every Moment',
  suite_body:
    'Pick one design once, and every card across your day matches your suite. No mixing fonts, no clashing palettes, no last-minute hunt for matching paper.',
  suite_categories: [
    { id: 'save-the-date', label: 'Save the Date', alt: 'Save the Date', image: '/assets/images/bridering.jpg' },
    { id: 'wedding', label: 'Wedding', alt: 'Wedding ceremony', image: '/assets/images/churchcouples.jpg' },
    { id: 'send-off', label: 'Send-Off', alt: 'Send-Off', image: '/assets/images/brideincar.jpg' },
    { id: 'kitchen-party', label: 'Kitchen Party', alt: 'Kitchen Party — bridal shower florals', image: '/assets/images/flowers_pinky.jpg' },
    { id: 'michango-vikao', label: 'Kadi za Michango & Vikao', alt: 'Kadi za Michango & Vikao', image: '/assets/images/mauzo_crew.jpg' },
  ],
}
