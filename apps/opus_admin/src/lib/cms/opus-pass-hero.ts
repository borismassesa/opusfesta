export type OpusPassHeroContent = {
  headline_line_1: string
  headline_line_2: string
  description: string
  primary_cta_label: string
  primary_cta_href: string
  secondary_cta_label: string
  secondary_cta_href: string
  main_image_url: string
  card_image_url: string
  card_heading: string
  card_link_label: string
  card_href: string
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
  headline_line_1: 'Your Wedding,',
  headline_line_2: 'One Beautiful Pass',
  description:
    'Send digital invites cards, track RSVPs live, and share a wedding website  all from one place',
  primary_cta_label: 'Get started',
  primary_cta_href: '/sign-up',
  secondary_cta_label: 'Browse invitations',
  secondary_cta_href: '/invitations',
  main_image_url: '/assets/images/cutesy_couple.jpg',
  card_image_url: '/assets/images/mauzo_crew.jpg',
  card_heading: 'See RSVPs roll in live',
  card_link_label: 'Explore guests & RSVPs',
  card_href: '/guests',
}
