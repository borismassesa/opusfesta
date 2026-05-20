export type OpusPassInvitationsHeroContent = {
  headline_line_1: string
  headline_line_2: string
  description: string
  primary_cta_label: string
  primary_cta_href: string
  secondary_cta_label: string
  secondary_cta_href: string
  /** Banner background colour (hex). */
  background_color: string
  /** Optional banner image shown on the right. When empty, the built-in flat-lay arrangement renders instead. */
  right_image_url: string
  right_image_alt: string
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
  headline_line_1: 'Invites worth saving.',
  headline_line_2: 'RSVPs worth tracking.',
  description:
    "Designer-worthy digital invitations that won't break your budget. Premium, personalised designs for every wedding moment, customisable in Swahili and English. FREE matching website with bilingual RSVP page included.",
  primary_cta_label: 'Browse all designs',
  primary_cta_href: '/invitations/catalog',
  secondary_cta_label: 'See pricing',
  secondary_cta_href: '/invitations/catalog',
  background_color: '#FAE6E9',
  right_image_url: '',
  right_image_alt: '',
}
