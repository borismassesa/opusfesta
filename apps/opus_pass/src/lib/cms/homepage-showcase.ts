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
}

export type HomepageShowcaseContent = {
  caption: HomepageShowcaseCaption
  // Flat list of photo cards in render order; the masonry layout and decorative
  // pills are fixed in the component and map to these images by index.
  images: HomepageShowcaseImage[]
}

export const HOMEPAGE_SHOWCASE_FALLBACK: HomepageShowcaseContent = {
  caption: {
    title: 'Your big day, beautifully shared',
    by: 'Created with',
    brand: 'OpusPass',
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
      }
    }
    return HOMEPAGE_SHOWCASE_FALLBACK
  } catch (err) {
    console.error('[opus-pass cms] homepage-showcase load failed', err)
    return HOMEPAGE_SHOWCASE_FALLBACK
  }
}
