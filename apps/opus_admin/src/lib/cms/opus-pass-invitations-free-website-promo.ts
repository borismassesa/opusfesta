export type OpusPassInvitationsFreeWebsitePromoContent = {
  eyebrow: string
  heading: string
  body: string
  cta_label: string
  cta_href: string
  /** When set, replaces the built-in 3-invitation arrangement on the right. */
  image_url: string
  image_alt: string
  background_color: string
}

export type OpusPassInvitationsFreeWebsitePromoRow = {
  id: string
  page_key: string
  section_key: string
  content: OpusPassInvitationsFreeWebsitePromoContent
  draft_content: OpusPassInvitationsFreeWebsitePromoContent | null
  is_published: boolean
  updated_at: string
}

export const OPUS_PASS_INVITATIONS_FREE_WEBSITE_PROMO_FALLBACK: OpusPassInvitationsFreeWebsitePromoContent = {
  eyebrow: 'Included with every order',
  heading: 'Get a free wedding website',
  body:
    'Pick any invitation and we’ll match it to a bilingual wedding website with a built-in RSVP form, address book, and guest list.',
  cta_label: 'Find your match',
  cta_href: '/my/planning',
  image_url: '',
  image_alt: '',
  background_color: '#F5EFE3',
}
