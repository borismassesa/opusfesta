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

export type AttireHeroRow = {
  id: string
  page_key: string
  section_key: string
  content: AttireHeroContent
  draft_content: AttireHeroContent | null
  is_published: boolean
  updated_at: string
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
