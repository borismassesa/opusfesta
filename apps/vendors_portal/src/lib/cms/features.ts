import { createSupabaseServerClient } from '@/lib/supabase-server'

export type FeatureMediaItem = {
  type: 'image' | 'video'
  url: string
}

export type FeaturePill = { id: string; label: string }

export type FeatureBlock = {
  id: string
  reverse: boolean
  headline_line_1: string
  headline_line_2: string
  body: string
  pills: FeaturePill[]
  primary_cta_label: string
  primary_cta_href: string
  secondary_cta_label: string
  secondary_cta_href: string
  media_main: FeatureMediaItem
  media_secondary: FeatureMediaItem
  media_overlay: FeatureMediaItem
  overlay_eyebrow: string
  overlay_caption_line_1: string
  overlay_caption_line_2: string
}

export type FeaturesContent = {
  eyebrow: string
  headline_line_1: string
  headline_line_2: string
  subheadline: string
  blocks: FeatureBlock[]
}

export const FEATURES_FALLBACK: FeaturesContent = {
  eyebrow: '',
  headline_line_1: 'Run your',
  headline_line_2: 'business better',
  subheadline: 'Everything you need to win bookings, delight clients, and grow — all in one dashboard.',
  blocks: [
    {
      id: 'storefront',
      reverse: false,
      headline_line_1: 'A storefront',
      headline_line_2: 'that sells.',
      body: 'Beautiful by default. Show off your portfolio, list your services, set transparent pricing, and let couples book a discovery call — without writing a line of code.',
      pills: [
        { id: 'p1', label: 'Portfolio gallery' },
        { id: 'p2', label: 'Service & price lists' },
        { id: 'p3', label: 'Custom URL' },
        { id: 'p4', label: 'SEO-ready' },
      ],
      primary_cta_label: 'Build your storefront',
      primary_cta_href: '/sign-up',
      secondary_cta_label: 'See an example',
      secondary_cta_href: '#testimonials',
      media_main: { type: 'image', url: '/assets/images/beautiful_bride.jpg' },
      media_secondary: { type: 'image', url: '/assets/images/coupleswithpiano.jpg' },
      media_overlay: { type: 'image', url: '/assets/images/flowers_pinky.jpg' },
      overlay_eyebrow: 'Storefront',
      overlay_caption_line_1: 'Look pro.',
      overlay_caption_line_2: 'Without a designer.',
    },
    {
      id: 'leads',
      reverse: true,
      headline_line_1: 'Leads that',
      headline_line_2: 'convert.',
      body: 'Get matched with couples whose date, location, budget and style fit yours. Reply from one inbox, send quotes in two clicks, and never lose a thread.',
      pills: [
        { id: 'p1', label: 'Smart matching' },
        { id: 'p2', label: 'Unified inbox' },
        { id: 'p3', label: 'Quote templates' },
        { id: 'p4', label: 'Auto follow-ups' },
      ],
      primary_cta_label: 'Start free',
      primary_cta_href: '/sign-up',
      secondary_cta_label: 'Read FAQs',
      secondary_cta_href: '#faq',
      media_main: { type: 'image', url: '/assets/images/mauzo_crew.jpg' },
      media_secondary: { type: 'image', url: '/assets/images/cutesy_couple.jpg' },
      media_overlay: { type: 'image', url: '/assets/images/hand_rings.jpg' },
      overlay_eyebrow: 'Leads',
      overlay_caption_line_1: 'Right brief.',
      overlay_caption_line_2: 'Right couple.',
    },
    {
      id: 'bookings',
      reverse: false,
      headline_line_1: 'Bookings.',
      headline_line_2: 'Without the chase.',
      body: 'Send a quote, sign a contract, collect a deposit via mobile money — all in one flow. Auto-reminders nudge couples on the balance so you never have to.',
      pills: [
        { id: 'p1', label: 'E-signatures' },
        { id: 'p2', label: 'M-Pesa & cards' },
        { id: 'p3', label: 'Auto reminders' },
        { id: 'p4', label: 'Calendar sync' },
      ],
      primary_cta_label: 'Start free',
      primary_cta_href: '/sign-up',
      secondary_cta_label: 'Talk to us',
      secondary_cta_href: '#faq',
      media_main: { type: 'image', url: '/assets/images/bride_umbrella.jpg' },
      media_secondary: { type: 'image', url: '/assets/images/churchcouples.jpg' },
      media_overlay: { type: 'image', url: '/assets/images/ring_piano.jpg' },
      overlay_eyebrow: 'Bookings',
      overlay_caption_line_1: 'Sign.',
      overlay_caption_line_2: 'Deposit. Done.',
    },
  ],
}

export async function loadFeaturesContent(): Promise<FeaturesContent> {
  if (!process.env.NEXT_PUBLIC_SUPABASE_URL || !process.env.SUPABASE_SERVICE_ROLE_KEY) {
    return FEATURES_FALLBACK
  }
  try {
    const supabase = createSupabaseServerClient()
    const { data } = await supabase
      .from('website_page_sections')
      .select('content')
      .eq('page_key', 'vendors_home')
      .eq('section_key', 'features')
      .maybeSingle()
    const stored = data?.content as Partial<FeaturesContent> | undefined
    if (stored) {
      return {
        ...FEATURES_FALLBACK,
        ...stored,
        blocks:
          Array.isArray(stored.blocks) && stored.blocks.length > 0
            ? (stored.blocks as FeatureBlock[])
            : FEATURES_FALLBACK.blocks,
      }
    }
    return FEATURES_FALLBACK
  } catch {
    return FEATURES_FALLBACK
  }
}
