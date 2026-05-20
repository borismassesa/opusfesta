export type OpusPassWebsitesHeroContent = {
  headline_line_1: string
  headline_line_2: string
  description: string
  primary_cta_label: string
  primary_cta_href: string
  secondary_cta_label: string
  secondary_cta_href: string
  background_color: string
  /** Optional uploaded image. When set, replaces the built-in laptop + phone mockup on the right. */
  right_image_url: string
  right_image_alt: string
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
  headline_line_1: 'Your wedding website,',
  headline_line_2: 'ready in minutes.',
  description:
    "Build a beautiful wedding website to share details, collect RSVPs and link your registry — all in one place. Free with every OpusPass, bilingual in Swahili and English.",
  primary_cta_label: 'Start your website',
  primary_cta_href: '/sign-up',
  secondary_cta_label: 'Explore designs',
  secondary_cta_href: '#designs',
  background_color: '#E1ECDB',
  right_image_url: '',
  right_image_alt: '',
}
