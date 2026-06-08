import { draftMode } from 'next/headers'
import { createSupabaseServerClient } from '@/lib/supabase'

export type HomepageShowcaseImage = {
  src: string
  alt: string
}

export type HomepageShowcaseCaption = {
  title: string
  by: string
  brand: string
  badge: string
}

// A floating decorative pill that pops over one of the photos. Each pill chooses
// which photo it attaches to (`slot`, a 0-based index into images[]), its own
// colour, and — for the "visit" kind — which edge it pops on. The pop-in
// animation is automatic (delays are derived from list order in the component).
export type HomepageShowcasePillKind = 'visit' | 'stat' | 'toggle'

export type HomepageShowcasePill = {
  id: string
  kind: HomepageShowcasePillKind
  slot: number
  color: string
  side: 'left' | 'right'
  // visit/toggle: the pill text. stat: the title (with `sublabel` under the chart).
  label: string
  sublabel: string
}

export type HomepageShowcaseContent = {
  caption: HomepageShowcaseCaption
  // Flat list of photo cards in render order; the masonry layout is fixed in the
  // component and maps these images by index. Pills attach to a card by `slot`.
  images: HomepageShowcaseImage[]
  pills: HomepageShowcasePill[]
  // Accent colour (hex) for the caption badge circle.
  accent_color: string
}

export const HOMEPAGE_SHOWCASE_FALLBACK: HomepageShowcaseContent = {
  caption: {
    title: 'Your big day, beautifully shared',
    by: 'Created with',
    brand: 'OpusPass',
    badge: 'O.',
  },
  images: [
    { src: '/assets/images/bride_umbrella.jpg', alt: 'Bride with umbrella' },
    { src: '/assets/images/churchcouples.jpg', alt: 'Couple at the ceremony' },
    { src: '/assets/images/hand_rings.jpg', alt: 'Hands with wedding rings' },
    { src: '/assets/images/cutesy_couple.jpg', alt: 'A happy couple' },
    { src: '/assets/images/coupleswithpiano.jpg', alt: 'Couple at the piano' },
    { src: '/assets/images/brideincar.jpg', alt: 'Bride in the car' },
    { src: '/assets/images/flowers_pinky.jpg', alt: 'Wedding flowers' },
  ],
  pills: [
    { id: 'visit-1', kind: 'visit', slot: 2, color: '#FFFFFF', side: 'left', label: 'Visit', sublabel: '' },
    { id: 'stat-1', kind: 'stat', slot: 1, color: '#9FE870', side: 'left', label: 'Performance', sublabel: 'Sales' },
    { id: 'visit-2', kind: 'visit', slot: 5, color: '#FFFFFF', side: 'right', label: 'Visit', sublabel: '' },
    { id: 'toggle-1', kind: 'toggle', slot: 6, color: '#9FE870', side: 'left', label: 'Live RSVPs', sublabel: '' },
  ],
  accent_color: '#9FE870',
}

export async function loadHomepageShowcaseContent(): Promise<HomepageShowcaseContent> {
  if (!process.env.NEXT_PUBLIC_SUPABASE_URL || !process.env.SUPABASE_SERVICE_ROLE_KEY) {
    return HOMEPAGE_SHOWCASE_FALLBACK
  }
  try {
    const { isEnabled: isDraft } = await draftMode()
    const supabase = createSupabaseServerClient()
    const { data } = await supabase
      .from('website_page_sections')
      .select('content, draft_content')
      .eq('page_key', 'opus-pass-homepage')
      .eq('section_key', 'showcase')
      .maybeSingle()
    const stored = (isDraft ? data?.draft_content ?? data?.content : data?.content) as
      | Partial<HomepageShowcaseContent>
      | undefined
    if (stored) {
      return {
        caption: { ...HOMEPAGE_SHOWCASE_FALLBACK.caption, ...stored.caption },
        images:
          stored.images && Array.isArray(stored.images) && stored.images.length > 0
            ? stored.images
            : HOMEPAGE_SHOWCASE_FALLBACK.images,
        pills:
          stored.pills && Array.isArray(stored.pills) && stored.pills.length > 0
            ? stored.pills
            : HOMEPAGE_SHOWCASE_FALLBACK.pills,
        accent_color: stored.accent_color || HOMEPAGE_SHOWCASE_FALLBACK.accent_color,
      }
    }
    return HOMEPAGE_SHOWCASE_FALLBACK
  } catch (err) {
    console.error('[opus-pass cms] homepage-showcase load failed', err)
    return HOMEPAGE_SHOWCASE_FALLBACK
  }
}
