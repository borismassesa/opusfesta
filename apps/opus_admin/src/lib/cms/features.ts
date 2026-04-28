export type FeatureMediaItem = {
  type: 'image' | 'video'
  url: string
}

export type FeaturePill = { id: string; label: string }

export type FeatureBlock = {
  id: string
  reverse: boolean // if true, text on right and media on left

  // Text side
  headline_line_1: string
  headline_line_2: string
  body: string
  pills: FeaturePill[]
  primary_cta_label: string
  primary_cta_href: string
  secondary_cta_label: string
  secondary_cta_href: string

  // Bento media (3 slots)
  media_main: FeatureMediaItem
  media_secondary: FeatureMediaItem
  media_overlay: FeatureMediaItem
  overlay_eyebrow: string
  overlay_caption_line_1: string
  overlay_caption_line_2: string
}

export type FeaturesContent = {
  // Section header
  eyebrow: string
  headline_line_1: string
  headline_line_2: string
  subheadline: string

  blocks: FeatureBlock[]
}

export type FeaturesRow = {
  id: string
  page_key: string
  section_key: string
  content: FeaturesContent
  draft_content: FeaturesContent | null
  is_published: boolean
  updated_at: string
}

export const FEATURES_FALLBACK: FeaturesContent = {
  eyebrow: 'Built for every part',
  headline_line_1: 'Beyond',
  headline_line_2: 'the basics',
  subheadline: 'Every tool you need to plan, style, and celebrate. All in one place.',
  blocks: [
    {
      id: 'attire',
      reverse: false,
      headline_line_1: 'Dress for',
      headline_line_2: 'your moment.',
      body: 'Find wedding dresses, groom suits, bridesmaid styles, and engagement rings from verified local boutiques, curated to match your vision.',
      pills: [
        { id: 'p1', label: 'Wedding dresses' },
        { id: 'p2', label: 'Suits & tuxedos' },
        { id: 'p3', label: 'Bridesmaid styles' },
        { id: 'p4', label: 'Engagement rings' },
      ],
      primary_cta_label: 'Explore Attire',
      primary_cta_href: '/attire-and-rings',
      secondary_cta_label: 'Browse rings',
      secondary_cta_href: '/attire-and-rings',
      media_main: { type: 'video', url: '/assets/videos/couple_.mp4' },
      media_secondary: { type: 'image', url: '/assets/images/couples_together.jpg' },
      media_overlay: { type: 'image', url: '/assets/images/bridering.jpg' },
      overlay_eyebrow: 'Rings & Jewellery',
      overlay_caption_line_1: 'The ring that',
      overlay_caption_line_2: 'ties it all.',
    },
    {
      id: 'ideas',
      reverse: true,
      headline_line_1: 'Get inspired.',
      headline_line_2: 'Plan better.',
      body: 'Browse thousands of real wedding stories, explore trending themes, and get expert advice matched to your style, budget, and location.',
      pills: [
        { id: 'p1', label: 'Real weddings' },
        { id: 'p2', label: 'Themes & styles' },
        { id: 'p3', label: 'Expert articles' },
        { id: 'p4', label: 'Budget breakdowns' },
      ],
      primary_cta_label: 'Browse Ideas',
      primary_cta_href: '/advice-and-ideas',
      secondary_cta_label: 'Read advice',
      secondary_cta_href: '/advice-and-ideas#planning-guides',
      media_main: { type: 'image', url: '/assets/images/coupleswithpiano.jpg' },
      media_secondary: { type: 'image', url: '/assets/images/cutesy_couple.jpg' },
      media_overlay: { type: 'image', url: '/assets/images/hand_rings.jpg' },
      overlay_eyebrow: 'Inspiration',
      overlay_caption_line_1: 'Dream it.',
      overlay_caption_line_2: 'Plan it. Live it.',
    },
    {
      id: 'registry',
      reverse: false,
      headline_line_1: 'Your registry.',
      headline_line_2: 'Any store.',
      body: 'Add gifts from any store worldwide, create a honeymoon cash fund, and track every thank-you note. All without the spreadsheet.',
      pills: [
        { id: 'p1', label: 'Any store' },
        { id: 'p2', label: 'Cash funds' },
        { id: 'p3', label: 'Thank-you tracker' },
        { id: 'p4', label: 'Group gifting' },
      ],
      primary_cta_label: 'Start Registry',
      primary_cta_href: '#',
      secondary_cta_label: 'See examples',
      secondary_cta_href: '#',
      media_main: { type: 'video', url: '/assets/videos/happy_couples.mov' },
      media_secondary: { type: 'image', url: '/assets/images/flowers_pinky.jpg' },
      media_overlay: {
        type: 'image',
        url: 'https://images.unsplash.com/photo-1549465220-1a8b9238cd48?auto=format&fit=crop&w=800&q=80',
      },
      overlay_eyebrow: 'Registry',
      overlay_caption_line_1: 'Every wish.',
      overlay_caption_line_2: 'One link.',
    },
  ],
}
