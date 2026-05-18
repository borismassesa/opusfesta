import { createSupabaseServerClient } from '@/lib/supabase'

export type AttireHeroContent = {
  headline: string
  description: string
  cta_label: string
  cta_href: string
  main_image_url: string
  card_image_url: string
  card_heading: string
  card_link_label: string
  card_href: string
}

export const ATTIRE_HERO_FALLBACK: AttireHeroContent = {
  headline: 'Find your perfect attire & rings',
  description:
    'Curated wedding dresses, tailored suits, and timeless engagement rings from trusted Tanzanian boutiques.',
  cta_label: 'Shop the bridal collection',
  cta_href: '/attire-and-rings/bridal-collection',
  main_image_url:
    'https://images.unsplash.com/photo-1511285560929-80b456fea0bc?auto=format&fit=crop&w=1200&q=80',
  card_image_url:
    'https://images.unsplash.com/photo-1595777457583-95e059d581b8?auto=format&fit=crop&w=1200&q=80',
  card_heading: 'Meet our top bridal vendors',
  card_link_label: 'Discover',
  card_href: '/attire-and-rings/bridal-collection',
}

export async function loadAttireHeroContent(): Promise<AttireHeroContent> {
  if (!process.env.NEXT_PUBLIC_SUPABASE_URL || !process.env.SUPABASE_SERVICE_ROLE_KEY) {
    return ATTIRE_HERO_FALLBACK
  }
  try {
    const supabase = createSupabaseServerClient()
    const { data } = await supabase
      .from('website_page_sections')
      .select('content')
      .eq('page_key', 'attire-and-rings')
      .eq('section_key', 'hero')
      .maybeSingle()
    const stored = data?.content as Partial<AttireHeroContent> | undefined
    if (stored) {
      return {
        headline: stored.headline ?? ATTIRE_HERO_FALLBACK.headline,
        description: stored.description ?? ATTIRE_HERO_FALLBACK.description,
        cta_label: stored.cta_label ?? ATTIRE_HERO_FALLBACK.cta_label,
        cta_href: stored.cta_href ?? ATTIRE_HERO_FALLBACK.cta_href,
        main_image_url: stored.main_image_url ?? ATTIRE_HERO_FALLBACK.main_image_url,
        card_image_url: stored.card_image_url ?? ATTIRE_HERO_FALLBACK.card_image_url,
        card_heading: stored.card_heading ?? ATTIRE_HERO_FALLBACK.card_heading,
        card_link_label: stored.card_link_label ?? ATTIRE_HERO_FALLBACK.card_link_label,
        card_href: stored.card_href ?? ATTIRE_HERO_FALLBACK.card_href,
      }
    }
    return ATTIRE_HERO_FALLBACK
  } catch {
    return ATTIRE_HERO_FALLBACK
  }
}
