export type HeroContent = {
  headline_line_1: string
  headline_line_2: string
  headline_line_3: string
  subheadline: string
  primary_cta_label: string
  primary_cta_href: string
  secondary_cta_label: string
  secondary_cta_href: string
  media_type: 'video' | 'image'
  media_url: string
}

export type HeroRow = {
  id: string
  page_key: string
  section_key: string
  content: HeroContent
  draft_content: HeroContent | null
  is_published: boolean
  updated_at: string
}

export const HERO_FALLBACK: HeroContent = {
  headline_line_1: 'Everything You Need',
  headline_line_2: 'To Plan Your Wedding',
  headline_line_3: 'All In One Place.',
  subheadline:
    'Make your wedding planning effortless. Discover venues, connect with vendors, and manage your registry. All from one easy-to-use platform.',
  primary_cta_label: 'Start planning',
  primary_cta_href: '#',
  secondary_cta_label: 'Find vendors',
  secondary_cta_href: '/vendors',
  media_type: 'video',
  media_url: '/assets/videos/couple_.mp4',
}
