export type RegistryCategory = {
  slug: string
  name: string
  title: string
  tagline: string
  img: string
  related: string[]
}

const KITCHEN_IMG = 'https://images.unsplash.com/photo-1556909212-d5b604d0c90d?auto=format&fit=crop&w=400&q=80'
const PLACE_SETTING_IMG = 'https://images.unsplash.com/photo-1630527152680-500b5453fb04?auto=format&fit=crop&w=400&q=80'
const BED_LINEN_IMG = 'https://images.unsplash.com/photo-1601276174812-63280a55656e?auto=format&fit=crop&w=400&q=80'
const SOFA_IMG = 'https://images.unsplash.com/photo-1759722665629-29df6ee4f9a5?auto=format&fit=crop&w=400&q=80'
const VASE_WHITE_IMG = 'https://images.unsplash.com/photo-1612179518346-cf36e6695c6c?auto=format&fit=crop&w=400&q=80'
const COCONUT_BEACH_IMG = 'https://images.unsplash.com/photo-1551523713-c1473aa01d9f?auto=format&fit=crop&w=400&q=80'
const BEACH_PALM_IMG = 'https://images.unsplash.com/photo-1603477849227-705c424d1d80?auto=format&fit=crop&w=400&q=80'
const DOLLAR_BILL_IMG = 'https://images.unsplash.com/photo-1608111283577-43d930222227?auto=format&fit=crop&w=400&q=80'

export const REGISTRY_CATEGORIES: RegistryCategory[] = [
  {
    slug: 'kitchen-dining',
    name: 'Kitchen & Dining',
    title: 'Kitchen & Dining Essentials',
    tagline: 'Cookware, small appliances, and everyday dinnerware for the home you’re building together.',
    img: KITCHEN_IMG,
    related: ['tabletop-bar', 'home-essentials', 'bed-bath'],
  },
  {
    slug: 'tabletop-bar',
    name: 'Tabletop & Bar',
    title: 'Tabletop & Bar',
    tagline: 'Glassware, serveware, and bar essentials for hosting your first dinner parties.',
    img: PLACE_SETTING_IMG,
    related: ['kitchen-dining', 'furniture-decor', 'home-essentials'],
  },
  {
    slug: 'bed-bath',
    name: 'Bed & Bath',
    title: 'Bed & Bath',
    tagline: 'Soft sheets, plush towels, and everything for a hotel-quality bedroom and bath.',
    img: BED_LINEN_IMG,
    related: ['furniture-decor', 'home-essentials', 'kitchen-dining'],
  },
  {
    slug: 'furniture-decor',
    name: 'Furniture & Décor',
    title: 'Furniture & Décor',
    tagline: 'Statement furniture and decorative pieces to make your first home feel like yours.',
    img: SOFA_IMG,
    related: ['bed-bath', 'home-essentials', 'tabletop-bar'],
  },
  {
    slug: 'home-essentials',
    name: 'Home Essentials',
    title: 'Home Essentials',
    tagline: 'The everyday practical gifts every new household actually needs.',
    img: VASE_WHITE_IMG,
    related: ['kitchen-dining', 'bed-bath', 'furniture-decor'],
  },
  {
    slug: 'outdoor-weekend',
    name: 'Outdoor & Weekend',
    title: 'Outdoor & Weekend',
    tagline: 'Gear for weekend getaways, picnics, and time outdoors as a couple.',
    img: COCONUT_BEACH_IMG,
    related: ['experiences-honeymoon', 'furniture-decor', 'home-essentials'],
  },
  {
    slug: 'experiences-honeymoon',
    name: 'Experiences & Honeymoon',
    title: 'Experiences & Honeymoon',
    tagline: 'Contribute toward the honeymoon, a date night, or an experience you’ll both remember.',
    img: BEACH_PALM_IMG,
    related: ['cash-funds', 'outdoor-weekend', 'home-essentials'],
  },
  {
    slug: 'cash-funds',
    name: 'Cash Funds',
    title: 'Cash Funds',
    tagline: 'Zero-fee cash funds — let guests contribute directly toward what you need most.',
    img: DOLLAR_BILL_IMG,
    related: ['experiences-honeymoon', 'home-essentials', 'kitchen-dining'],
  },
]

export function getRegistryCategory(slug: string): RegistryCategory | undefined {
  return REGISTRY_CATEGORIES.find((c) => c.slug === slug)
}
