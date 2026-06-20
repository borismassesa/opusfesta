import type { MaybeLocalized } from '@/lib/cms/localized'

export type OpusPassWebsitesFeatureIcon = 'sparkles' | 'users' | 'link'
export type OpusPassWebsitesFeatureVisual = 'laptop' | 'rsvp' | 'registry'

export const OPUS_PASS_WEBSITES_FEATURE_ICONS: OpusPassWebsitesFeatureIcon[] = [
  'sparkles',
  'users',
  'link',
]
export const OPUS_PASS_WEBSITES_FEATURE_VISUALS: OpusPassWebsitesFeatureVisual[] = [
  'laptop',
  'rsvp',
  'registry',
]

export type OpusPassWebsitesFeatureItem = {
  id: string
  icon: OpusPassWebsitesFeatureIcon
  // Translatable text.
  title: MaybeLocalized
  body: MaybeLocalized
  cta_label: MaybeLocalized
  // Non-translatable config.
  cta_href: string
  visual: OpusPassWebsitesFeatureVisual
  /** Optional uploaded image — replaces the CSS visual mock when set. */
  image_url: string
}

export type OpusPassWebsitesFeaturesContent = {
  heading: MaybeLocalized
  description: MaybeLocalized
  background_color: string
  items: OpusPassWebsitesFeatureItem[]
}

export type OpusPassWebsitesFeaturesRow = {
  id: string
  page_key: string
  section_key: string
  content: OpusPassWebsitesFeaturesContent
  draft_content: OpusPassWebsitesFeaturesContent | null
  is_published: boolean
  updated_at: string
}

export const OPUS_PASS_WEBSITES_FEATURES_FALLBACK: OpusPassWebsitesFeaturesContent = {
  heading: 'Create your free website',
  description: 'Save time and simplify how you keep guests in the loop, in one easy place.',
  background_color: '#FCE9C2',
  items: [
    {
      id: 'easy',
      icon: 'sparkles',
      title: 'Easy to set up',
      body: 'Pick a design, add your photo and date, share the link. The whole site is live in under 10 minutes — no tech skills needed.',
      cta_label: 'See how it works',
      cta_href: '#how-it-works',
      visual: 'laptop',
      image_url: '',
    },
    {
      id: 'rsvps',
      icon: 'users',
      title: 'Keep RSVPs simple',
      body: 'Guests RSVP straight from your site. Meal choices, plus-ones and dietary notes flow into your guest dashboard live.',
      cta_label: 'See the RSVP flow',
      cta_href: '/guests',
      visual: 'rsvp',
      image_url: '',
    },
    {
      id: 'registry',
      icon: 'link',
      title: 'Link any registry',
      body: 'Link to your M-Pesa contribution page, a Tanzanian store registry, or a global gift list — your guests find them in one tap.',
      cta_label: 'Explore registries',
      cta_href: '/registry',
      visual: 'registry',
      image_url: '',
    },
  ],
}
