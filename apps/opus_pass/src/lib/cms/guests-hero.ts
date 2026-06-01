import { draftMode } from 'next/headers'
import { createSupabaseServerClient } from '@/lib/supabase'

export type GuestsHeroImage = {
  src: string
  alt: string
}

export type GuestsHeroContent = {
  headline_lead: string
  headline_highlight: string
  description: string
  primary_cta_label: string
  primary_cta_href: string
  secondary_cta_label: string
  secondary_cta_href: string
  trust_lead: string
  trust_rest: string
  avatars: string[]
  collage: GuestsHeroImage[]
}

export const GUESTS_HERO_FALLBACK: GuestsHeroContent = {
  headline_lead: 'Your guest list, replying in',
  headline_highlight: 'real time',
  description:
    'Send digital invitations by WhatsApp or SMS and watch the “Joyful yes” replies roll in — a free guest list and bilingual RSVP page in English & Swahili.',
  primary_cta_label: 'Start your guest list',
  primary_cta_href: '/sign-up?redirect_url=%2Fmy%2Fdashboard%3Fseed%3D1',
  secondary_cta_label: 'See how it works',
  secondary_cta_href: '#collection',
  trust_lead: 'Trusted by 500+',
  trust_rest: 'Tanzanian couples',
  avatars: [
    '/assets/images/cutesy_couple.jpg',
    '/assets/images/authentic_couple.jpg',
    '/assets/images/couples_together.jpg',
    '/assets/images/beautiful_bride.jpg',
  ],
  collage: [
    { src: '/assets/images/flowers_pinky.jpg', alt: 'Wedding flowers' },
    { src: '/assets/images/bridering.jpg', alt: 'Wedding rings' },
    { src: '/assets/images/cutesy_couple.jpg', alt: 'A couple celebrating with their guests' },
    { src: '/assets/images/hand_rings.jpg', alt: 'Hands with wedding rings' },
    { src: '/assets/images/authentic_couple.jpg', alt: 'Couple portrait' },
    { src: '/assets/images/coupleswithpiano.jpg', alt: 'Couple at the piano' },
  ],
}

export async function loadGuestsHeroContent(): Promise<GuestsHeroContent> {
  if (!process.env.NEXT_PUBLIC_SUPABASE_URL || !process.env.SUPABASE_SERVICE_ROLE_KEY) {
    return GUESTS_HERO_FALLBACK
  }
  try {
    const { isEnabled: isDraft } = await draftMode()
    const supabase = createSupabaseServerClient()
    const { data } = await supabase
      .from('website_page_sections')
      .select('content, draft_content')
      .eq('page_key', 'opus-pass-guests')
      .eq('section_key', 'hero')
      .maybeSingle()
    const stored = (isDraft ? data?.draft_content ?? data?.content : data?.content) as
      | Partial<GuestsHeroContent>
      | undefined
    if (stored) {
      return {
        ...GUESTS_HERO_FALLBACK,
        ...stored,
        avatars:
          stored.avatars && Array.isArray(stored.avatars) && stored.avatars.length > 0
            ? stored.avatars
            : GUESTS_HERO_FALLBACK.avatars,
        collage:
          stored.collage && Array.isArray(stored.collage) && stored.collage.length > 0
            ? stored.collage
            : GUESTS_HERO_FALLBACK.collage,
      }
    }
    return GUESTS_HERO_FALLBACK
  } catch (err) {
    console.error('[opus-pass cms] guests-hero load failed', err)
    return GUESTS_HERO_FALLBACK
  }
}
