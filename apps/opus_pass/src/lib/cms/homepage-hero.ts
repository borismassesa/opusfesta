import { draftMode } from 'next/headers'
import { createSupabaseServerClient } from '@/lib/supabase'

export type HomepageHeroContent = {
  headline_line_1: string
  headline_line_2: string
  description: string
  primary_cta_label: string
  primary_cta_href: string
  secondary_cta_label: string
  secondary_cta_href: string
  main_image_url: string
  card_image_url: string
  card_heading: string
  card_link_label: string
  card_href: string
}

export const HOMEPAGE_HERO_FALLBACK: HomepageHeroContent = {
  headline_line_1: 'Your Wedding,',
  headline_line_2: 'One Beautiful Pass',
  description:
    'Send digital invites cards, track RSVPs live, and share a wedding website  all from one place',
  primary_cta_label: 'Get started',
  primary_cta_href: '/sign-up',
  secondary_cta_label: 'Browse invitations',
  secondary_cta_href: '/invitations',
  main_image_url: '/assets/images/cutesy_couple.jpg',
  card_image_url: '/assets/images/mauzo_crew.jpg',
  card_heading: 'See RSVPs roll in live',
  card_link_label: 'Explore guests & RSVPs',
  card_href: '/guests',
}

export async function loadHomepageHeroContent(): Promise<HomepageHeroContent> {
  if (!process.env.NEXT_PUBLIC_SUPABASE_URL || !process.env.SUPABASE_SERVICE_ROLE_KEY) {
    return HOMEPAGE_HERO_FALLBACK
  }
  try {
    const { isEnabled: isDraft } = await draftMode()
    const supabase = createSupabaseServerClient()
    const { data } = await supabase
      .from('website_page_sections')
      .select('content, draft_content')
      .eq('page_key', 'opus-pass-homepage')
      .eq('section_key', 'hero')
      .maybeSingle()
    const stored = (isDraft ? data?.draft_content ?? data?.content : data?.content) as
      | Partial<HomepageHeroContent>
      | undefined
    if (stored) {
      return { ...HOMEPAGE_HERO_FALLBACK, ...stored }
    }
    return HOMEPAGE_HERO_FALLBACK
  } catch (err) {
    console.error('[opus-pass cms] homepage-hero load failed', err)
    return HOMEPAGE_HERO_FALLBACK
  }
}
