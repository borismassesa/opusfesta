export type AttirePickItem = {
  id: string
  img: string
  has_video: boolean
  has_heart: boolean
  price: string
}

export type AttireEditorsPicksContent = {
  eyebrow: string
  heading: string
  cta_label: string
  footer_text: string
  row1: AttirePickItem[]
  row2: AttirePickItem[]
}

export type AttireEditorsPicksRow = {
  id: string
  page_key: string
  section_key: string
  content: AttireEditorsPicksContent
  draft_content: AttireEditorsPicksContent | null
  is_published: boolean
  updated_at: string
}

export const ATTIRE_EDITORS_PICKS_FALLBACK: AttireEditorsPicksContent = {
  eyebrow: "Editors' Picks",
  heading: 'Bridal & Accessories Favourites',
  cta_label: 'Shop these unique finds',
  footer_text: 'Your one-stop shop for wedding attire, rings, and accessories',
  row1: [
    { id: '1', img: 'https://images.unsplash.com/photo-1595777457583-95e059d581b8?auto=format&fit=crop&w=800&q=80', has_video: true, has_heart: false, price: '' },
    { id: '2', img: 'https://images.unsplash.com/photo-1511285560929-80b456fea0bc?auto=format&fit=crop&w=800&q=80', has_video: false, has_heart: false, price: '' },
    { id: '3', img: 'https://images.unsplash.com/photo-1593030761757-71fae45fa0e7?auto=format&fit=crop&w=800&q=80', has_video: false, has_heart: false, price: '' },
  ],
  row2: [
    { id: '4', img: 'https://images.unsplash.com/photo-1543163521-1bf539c55dd2?auto=format&fit=crop&w=800&q=80', has_video: true, has_heart: false, price: '' },
    { id: '5', img: 'https://images.unsplash.com/photo-1515934751635-c81c6bc9a2d8?auto=format&fit=crop&w=800&q=80', has_video: false, has_heart: true, price: 'TZS 2,298,000' },
    { id: '6', img: 'https://images.unsplash.com/photo-1606800052052-a08af7148866?auto=format&fit=crop&w=800&q=80', has_video: true, has_heart: false, price: '' },
  ],
}
