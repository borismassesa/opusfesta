import { draftMode } from 'next/headers'
import { createSupabaseServerClient } from '@/lib/supabase'

export type HomepageStationeryVisual = 'palette' | 'website' | 'envelopes'

export type HomepageStationeryCard = {
  id: string
  title: string
  description: string
  cta_label: string
  cta_href: string
  image: string
  visual: HomepageStationeryVisual
}

export type HomepageStationeryContent = {
  heading: string
  swatches: string[]
  cards: HomepageStationeryCard[]
}

export const HOMEPAGE_STATIONERY_FALLBACK: HomepageStationeryContent = {
  heading: 'Your wedding suite made easy, from design to delivery',
  swatches: ['#7b1d1d', '#1f2a59', '#f1e3d5', '#c98080', '#9bb6cc', '#c47a3a'],
  cards: [
    {
      id: 'design-assistance',
      title: 'Free Design Assistance',
      description:
        'Turn your design into something made for your wedding. From custom layouts to fonts and colours, our team is here to help.',
      cta_label: 'Start personalizing',
      cta_href: '/invitations/catalog',
      image: '/assets/images/cutesy_couple.jpg',
      visual: 'palette',
    },
    {
      id: 'matching-website',
      title: 'Free Matching Website',
      description:
        'Pair your invitation with a coordinated wedding website so your details, RSVPs and gallery live in one beautifully cohesive place.',
      cta_label: 'Find your match',
      cta_href: '/websites',
      image: '/assets/images/coupleswithpiano.jpg',
      visual: 'website',
    },
    {
      id: 'guest-messaging',
      title: 'Easy Guest Messaging',
      description:
        'Skip the handwriting hassle and let us send your invites by WhatsApp or SMS. Track delivery and RSVPs in real time.',
      cta_label: 'Get started',
      cta_href: '/guests',
      image: '/assets/images/churchcouples.jpg',
      visual: 'envelopes',
    },
  ],
}

export async function loadHomepageStationeryContent(): Promise<HomepageStationeryContent> {
  if (!process.env.NEXT_PUBLIC_SUPABASE_URL || !process.env.SUPABASE_SERVICE_ROLE_KEY) {
    return HOMEPAGE_STATIONERY_FALLBACK
  }
  try {
    const { isEnabled: isDraft } = await draftMode()
    const supabase = createSupabaseServerClient()
    const { data } = await supabase
      .from('website_page_sections')
      .select('content, draft_content')
      .eq('page_key', 'opus-pass-homepage')
      .eq('section_key', 'stationery')
      .maybeSingle()
    const stored = (isDraft ? data?.draft_content ?? data?.content : data?.content) as
      | Partial<HomepageStationeryContent>
      | undefined
    if (stored) {
      return {
        heading: stored.heading ?? HOMEPAGE_STATIONERY_FALLBACK.heading,
        swatches:
          stored.swatches && Array.isArray(stored.swatches) && stored.swatches.length > 0
            ? stored.swatches
            : HOMEPAGE_STATIONERY_FALLBACK.swatches,
        cards:
          stored.cards && Array.isArray(stored.cards) && stored.cards.length > 0
            ? stored.cards
            : HOMEPAGE_STATIONERY_FALLBACK.cards,
      }
    }
    return HOMEPAGE_STATIONERY_FALLBACK
  } catch (err) {
    console.error('[opus-pass cms] homepage-stationery load failed', err)
    return HOMEPAGE_STATIONERY_FALLBACK
  }
}
