export type AttireGiftItem = {
  id: string
  name: string
  img: string
}

export type AttireGiftSectionContent = {
  heading: string
  cta_label: string
  gifts: AttireGiftItem[]
}

export type AttireGiftSectionRow = {
  id: string
  page_key: string
  section_key: string
  content: AttireGiftSectionContent
  draft_content: AttireGiftSectionContent | null
  is_published: boolean
  updated_at: string
}

export const ATTIRE_GIFT_SECTION_FALLBACK: AttireGiftSectionContent = {
  heading: 'OpusFesta-special rings & wedding attire',
  cta_label: 'Get inspired',
  gifts: [
    { id: '1', name: 'Diamond Engagement Rings', img: 'https://images.unsplash.com/photo-1511285560929-80b456fea0bc?auto=format&fit=crop&w=600&q=80' },
    { id: '2', name: 'Vintage Wedding Dresses', img: 'https://images.unsplash.com/photo-1595777457583-95e059d581b8?auto=format&fit=crop&w=600&q=80' },
    { id: '3', name: 'Designer Tuxedos', img: 'https://images.unsplash.com/photo-1593030761757-71fae45fa0e7?auto=format&fit=crop&w=600&q=80' },
  ],
}
