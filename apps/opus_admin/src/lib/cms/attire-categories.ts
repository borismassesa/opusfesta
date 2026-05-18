export type AttireCategoryItem = {
  id: string
  name: string
  img: string
}

export type AttireCategoriesContent = {
  title: string
  items: AttireCategoryItem[]
}

export type AttireCategoriesRow = {
  id: string
  page_key: string
  section_key: string
  content: AttireCategoriesContent
  draft_content: AttireCategoriesContent | null
  is_published: boolean
  updated_at: string
}

export const ATTIRE_CATEGORIES_FALLBACK: AttireCategoriesContent = {
  title: 'Discover trending wedding attire & rings',
  items: [
    { id: '1', name: 'Diamond Rings', img: 'https://images.unsplash.com/photo-1511285560929-80b456fea0bc?auto=format&fit=crop&w=400&q=80' },
    { id: '2', name: "Men's Tuxedos", img: 'https://images.unsplash.com/photo-1593030761757-71fae45fa0e7?auto=format&fit=crop&w=400&q=80' },
    { id: '3', name: 'Lace Dresses', img: 'https://images.unsplash.com/photo-1595777457583-95e059d581b8?auto=format&fit=crop&w=400&q=80' },
    { id: '4', name: 'Wedding Bands', img: 'https://images.unsplash.com/photo-1515934751635-c81c6bc9a2d8?auto=format&fit=crop&w=400&q=80' },
    { id: '5', name: 'Bridal Accessories', img: 'https://images.unsplash.com/photo-1606800052052-a08af7148866?auto=format&fit=crop&w=400&q=80' },
    { id: '6', name: 'Bridesmaid Gowns', img: 'https://images.unsplash.com/photo-1591604466107-ec97de577aff?auto=format&fit=crop&w=400&q=80' },
  ],
}

export const ATTIRE_LOVED_CATEGORIES_FALLBACK: AttireCategoriesContent = {
  title: 'Shop our most-loved categories',
  items: [
    { id: '1', name: 'Wedding Dresses', img: 'https://images.unsplash.com/photo-1595777457583-95e059d581b8?auto=format&fit=crop&w=400&q=80' },
    { id: '2', name: 'Groom Suits', img: 'https://images.unsplash.com/photo-1593030761757-71fae45fa0e7?auto=format&fit=crop&w=400&q=80' },
    { id: '3', name: 'Engagement Rings', img: 'https://images.unsplash.com/photo-1511285560929-80b456fea0bc?auto=format&fit=crop&w=400&q=80' },
    { id: '4', name: 'Wedding Bands', img: 'https://images.unsplash.com/photo-1515934751635-c81c6bc9a2d8?auto=format&fit=crop&w=400&q=80' },
    { id: '5', name: 'Bridal Shoes', img: 'https://images.unsplash.com/photo-1543163521-1bf539c55dd2?auto=format&fit=crop&w=400&q=80' },
    { id: '6', name: 'Veils & Headpieces', img: 'https://images.unsplash.com/photo-1606800052052-a08af7148866?auto=format&fit=crop&w=400&q=80' },
  ],
}
