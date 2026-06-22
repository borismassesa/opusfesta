import { createSupabaseServerClient } from '@/lib/supabase-server'
import { DEFAULT_LOCALE, resolveLocalized, type Locale, type MaybeLocalized } from './localized'

export type FeatureMediaItem = {
  type: 'image' | 'video'
  url: string
}

// What the render component receives: every translatable field already resolved
// to a flat string in the active locale.
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

// What's stored in the DB: translatable fields may be `{ en, sw }` objects (or
// legacy plain strings). Resolved down to the flat types above at load time.
type StoredFeaturePill = { id: string; label: MaybeLocalized }

type StoredFeatureBlock = Omit<
  FeatureBlock,
  | 'headline_line_1'
  | 'headline_line_2'
  | 'body'
  | 'pills'
  | 'primary_cta_label'
  | 'secondary_cta_label'
  | 'overlay_eyebrow'
  | 'overlay_caption_line_1'
  | 'overlay_caption_line_2'
> & {
  headline_line_1: MaybeLocalized
  headline_line_2: MaybeLocalized
  body: MaybeLocalized
  pills: StoredFeaturePill[]
  primary_cta_label: MaybeLocalized
  secondary_cta_label: MaybeLocalized
  overlay_eyebrow: MaybeLocalized
  overlay_caption_line_1: MaybeLocalized
  overlay_caption_line_2: MaybeLocalized
}

type StoredFeaturesContent = Omit<
  FeaturesContent,
  'eyebrow' | 'headline_line_1' | 'headline_line_2' | 'subheadline' | 'blocks'
> & {
  eyebrow: MaybeLocalized
  headline_line_1: MaybeLocalized
  headline_line_2: MaybeLocalized
  subheadline: MaybeLocalized
  blocks: StoredFeatureBlock[]
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

// Resolve a stored block (translatable fields may be `{ en, sw }` or legacy
// plain strings) into a flat FeatureBlock in the active locale. Scalars
// (reverse, hrefs, media) pass through untouched.
function resolveBlock(block: StoredFeatureBlock, locale: Locale): FeatureBlock {
  return {
    id: block.id,
    reverse: block.reverse,
    headline_line_1: resolveLocalized(block.headline_line_1, locale),
    headline_line_2: resolveLocalized(block.headline_line_2, locale),
    body: resolveLocalized(block.body, locale),
    pills: Array.isArray(block.pills)
      ? block.pills.map((p) => ({ id: p.id, label: resolveLocalized(p.label, locale) }))
      : [],
    primary_cta_label: resolveLocalized(block.primary_cta_label, locale),
    primary_cta_href: block.primary_cta_href,
    secondary_cta_label: resolveLocalized(block.secondary_cta_label, locale),
    secondary_cta_href: block.secondary_cta_href,
    media_main: block.media_main,
    media_secondary: block.media_secondary,
    media_overlay: block.media_overlay,
    overlay_eyebrow: resolveLocalized(block.overlay_eyebrow, locale),
    overlay_caption_line_1: resolveLocalized(block.overlay_caption_line_1, locale),
    overlay_caption_line_2: resolveLocalized(block.overlay_caption_line_2, locale),
  }
}

export async function loadFeaturesContent(locale: Locale = DEFAULT_LOCALE): Promise<FeaturesContent> {
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
    const stored = data?.content as Partial<StoredFeaturesContent> | undefined
    if (stored) {
      const hasBlocks = Array.isArray(stored.blocks) && stored.blocks.length > 0
      return {
        eyebrow:
          stored.eyebrow !== undefined
            ? resolveLocalized(stored.eyebrow, locale)
            : FEATURES_FALLBACK.eyebrow,
        headline_line_1:
          stored.headline_line_1 !== undefined
            ? resolveLocalized(stored.headline_line_1, locale)
            : FEATURES_FALLBACK.headline_line_1,
        headline_line_2:
          stored.headline_line_2 !== undefined
            ? resolveLocalized(stored.headline_line_2, locale)
            : FEATURES_FALLBACK.headline_line_2,
        subheadline:
          stored.subheadline !== undefined
            ? resolveLocalized(stored.subheadline, locale)
            : FEATURES_FALLBACK.subheadline,
        blocks: hasBlocks
          ? stored.blocks!.map((b) => resolveBlock(b, locale))
          : FEATURES_FALLBACK.blocks,
      }
    }
    return FEATURES_FALLBACK
  } catch {
    return FEATURES_FALLBACK
  }
}
