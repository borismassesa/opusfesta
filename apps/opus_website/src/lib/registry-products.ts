import { REGISTRY_CATEGORIES, getRegistryCategory, type RegistryCategory } from './registry-categories'

export type SwatchColor = { name: string; swatch: string }

export type Product = {
  id: number
  name: string
  price: string
  priceTzs: number
  oldPrice?: string
  oldPriceTzs?: number
  rating: string
  reviews: number
  img: string
  gallery: string[]
  badge?: 'Bestseller' | "OpusFesta's Pick" | 'Most Wanted'
  mostWanted: boolean
  category: RegistryCategory
  brand: { name: string; location: string }
  description: string
  highlights: string[]
  colors?: SwatchColor[]
}

const IMG = {
  kitchen: 'https://images.unsplash.com/photo-1556909212-d5b604d0c90d?auto=format&fit=crop&w=1200&q=80',
  dinnerware: 'https://images.unsplash.com/photo-1562050344-f7ad946cee35?auto=format&fit=crop&w=1200&q=80',
  placeSetting: 'https://images.unsplash.com/photo-1630527152680-500b5453fb04?auto=format&fit=crop&w=1200&q=80',
  candleTable: 'https://images.unsplash.com/photo-1562050147-fda1cc9a6378?auto=format&fit=crop&w=1200&q=80',
  wineGlass: 'https://images.unsplash.com/photo-1613477581402-306fa9dc6b95?auto=format&fit=crop&w=1200&q=80',
  winePour: 'https://images.unsplash.com/photo-1705944601076-ffa84903c6cb?auto=format&fit=crop&w=1200&q=80',
  bedLinen: 'https://images.unsplash.com/photo-1601276174812-63280a55656e?auto=format&fit=crop&w=1200&q=80',
  bedPlant: 'https://images.unsplash.com/photo-1606796913825-2b02883605e9?auto=format&fit=crop&w=1200&q=80',
  sofa: 'https://images.unsplash.com/photo-1759722665629-29df6ee4f9a5?auto=format&fit=crop&w=1200&q=80',
  livingRoom: 'https://images.unsplash.com/photo-1667584523543-d1d9cc828a15?auto=format&fit=crop&w=1200&q=80',
  vaseGrass: 'https://images.unsplash.com/photo-1623244307563-f9ade3df13c0?auto=format&fit=crop&w=1200&q=80',
  vaseRed: 'https://images.unsplash.com/photo-1615891618972-799500c621b9?auto=format&fit=crop&w=1200&q=80',
  vaseWhite: 'https://images.unsplash.com/photo-1612179518346-cf36e6695c6c?auto=format&fit=crop&w=1200&q=80',
  beachPalm: 'https://images.unsplash.com/photo-1603477849227-705c424d1d80?auto=format&fit=crop&w=1200&q=80',
  seashore: 'https://images.unsplash.com/photo-1507525428034-b723cf961d3e?auto=format&fit=crop&w=1200&q=80',
  coconutBeach: 'https://images.unsplash.com/photo-1551523713-c1473aa01d9f?auto=format&fit=crop&w=1200&q=80',
  giftBoxGold: 'https://images.unsplash.com/photo-1674620213535-9b2a2553ef40?auto=format&fit=crop&w=1200&q=80',
  giftBoxPink: 'https://images.unsplash.com/photo-1513201099705-a9746e1e201f?auto=format&fit=crop&w=1200&q=80',
  giftBoxColor: 'https://images.unsplash.com/photo-1647221598398-934ed5cb0e4f?auto=format&fit=crop&w=1200&q=80',
  dollarBill: 'https://images.unsplash.com/photo-1608111283577-43d930222227?auto=format&fit=crop&w=1200&q=80',
  dollarYellow: 'https://images.unsplash.com/photo-1642959791546-d11908297a55?auto=format&fit=crop&w=1200&q=80',
}

const CATEGORY_IMG_POOL: Record<string, string[]> = {
  'kitchen-dining': [IMG.kitchen, IMG.dinnerware, IMG.placeSetting],
  'tabletop-bar': [IMG.placeSetting, IMG.wineGlass, IMG.winePour, IMG.candleTable],
  'bed-bath': [IMG.bedLinen, IMG.bedPlant],
  'furniture-decor': [IMG.sofa, IMG.livingRoom, IMG.vaseGrass, IMG.vaseRed],
  'home-essentials': [IMG.vaseWhite, IMG.vaseGrass, IMG.candleTable, IMG.dinnerware],
  'outdoor-weekend': [IMG.coconutBeach, IMG.beachPalm, IMG.seashore],
  'experiences-honeymoon': [IMG.beachPalm, IMG.seashore, IMG.coconutBeach],
  'cash-funds': [IMG.dollarBill, IMG.dollarYellow, IMG.giftBoxGold, IMG.giftBoxPink, IMG.giftBoxColor],
}

function poolFor(categorySlug: string): string[] {
  return CATEGORY_IMG_POOL[categorySlug] ?? Object.values(IMG)
}

const METAL_COLORS: SwatchColor[] = [
  { name: 'Matte black', swatch: '#1a1a1a' },
  { name: 'Brushed steel', swatch: '#b8b8b8' },
  { name: 'Copper', swatch: '#b87333' },
]

const LINEN_COLORS: SwatchColor[] = [
  { name: 'Ivory', swatch: '#fffff0' },
  { name: 'Sage', swatch: '#9caf88' },
  { name: 'Terracotta', swatch: '#c1654a' },
  { name: 'Charcoal', swatch: '#36454f' },
]

const COLORS_BY_SLUG: Record<string, SwatchColor[]> = {
  'kitchen-dining': METAL_COLORS,
  'tabletop-bar': [
    { name: 'Clear', swatch: '#eef3f5' },
    { name: 'Smoked', swatch: '#4a4a4a' },
    { name: 'Amber', swatch: '#b8722e' },
  ],
  'bed-bath': LINEN_COLORS,
  'furniture-decor': [
    { name: 'Oatmeal', swatch: '#e3dac9' },
    { name: 'Charcoal', swatch: '#36454f' },
    { name: 'Rust', swatch: '#a0522d' },
  ],
  'home-essentials': LINEN_COLORS,
}

const PRICE_TIERS: { price: string; priceTzs: number; oldPrice?: string; oldPriceTzs?: number }[] = [
  { price: 'TZS 38,000', priceTzs: 38_000 },
  { price: 'TZS 62,000', priceTzs: 62_000, oldPrice: 'TZS 78,000', oldPriceTzs: 78_000 },
  { price: 'TZS 95,000', priceTzs: 95_000 },
  { price: 'TZS 145,000', priceTzs: 145_000, oldPrice: 'TZS 180,000', oldPriceTzs: 180_000 },
  { price: 'TZS 210,000', priceTzs: 210_000 },
  { price: 'TZS 265,000', priceTzs: 265_000, oldPrice: 'TZS 320,000', oldPriceTzs: 320_000 },
  { price: 'TZS 320,000', priceTzs: 320_000 },
  { price: 'TZS 450,000', priceTzs: 450_000 },
  { price: 'TZS 580,000', priceTzs: 580_000, oldPrice: 'TZS 700,000', oldPriceTzs: 700_000 },
  { price: 'TZS 850,000', priceTzs: 850_000 },
  { price: 'TZS 25,000', priceTzs: 25_000 },
  { price: 'TZS 18,000', priceTzs: 18_000 },
]

const PRODUCT_NAMES: Record<string, string[]> = {
  'kitchen-dining': [
    'Cast-iron 3-piece cookware set',
    '12-speed countertop stand mixer',
    'Ceramic non-stick frying pan set',
    'Precision digital kitchen scale',
    'Espresso machine with milk frother',
    'Bamboo cutting board trio',
    'Stainless steel chef\'s knife set',
    'Electric kettle with temperature control',
    'Enamel dutch oven, 6-quart',
    '8-piece mixing bowl set',
  ],
  'tabletop-bar': [
    '12-piece stoneware dinnerware set',
    'Hand-blown wine glasses, set of 6',
    'Marble and brass bar cart',
    'Cocktail shaker and bar tool set',
    'Linen napkins, set of 8',
    'Crystal decanter with stopper',
    'Copper mule mug set of 4',
    'Slate cheese board with tools',
    'Everyday flatware set, 20-piece',
    'Ceramic serving platter, large',
  ],
  'bed-bath': [
    'Egyptian cotton sheet set, queen',
    'Plush bath towel set, 6-piece',
    'Weighted duvet insert',
    'Memory foam pillow pair',
    'Waffle-knit bathrobe, his & hers',
    'Bamboo bath mat set',
    'Silk pillowcase pair',
    'Heated mattress topper',
    'Linen duvet cover set',
    'Spa-quality towel warmer',
  ],
  'furniture-decor': [
    'Boucle accent chair',
    'Solid oak coffee table',
    'Ceramic table lamp pair',
    'Handwoven area rug, 5x7',
    'Floor-to-ceiling bookshelf',
    'Velvet throw pillow set',
    'Rattan storage baskets, set of 3',
    'Framed art print trio',
    'Wall-mounted entryway mirror',
    'Console table with brass legs',
  ],
  'home-essentials': [
    'Cordless robot vacuum',
    'Air purifier for bedrooms',
    'Smart video doorbell',
    'Ceramic diffuser and essential oils',
    'Fold-away drying rack',
    'Glass food storage set',
    'Bedside charging organiser',
    'First-apartment tool kit',
    'Smart plug 4-pack',
    'Reusable produce bag set',
  ],
  'outdoor-weekend': [
    'Insulated picnic backpack',
    'Portable bluetooth speaker',
    'Two-person camping hammock',
    'Cast-iron grill set',
    'Foldable outdoor lounge chairs, pair',
    'Rooftop tent for weekend trips',
    'Insulated wine tumblers, set of 2',
    'Waterproof picnic blanket',
    'Portable espresso maker',
    'Solar lantern pair',
  ],
  'experiences-honeymoon': [
    'Honeymoon fund contribution — Zanzibar',
    'Couples spa day contribution',
    'Sunset dhow cruise for two',
    'Serengeti safari day contribution',
    'Wine tasting experience for two',
    'Hot air balloon ride contribution',
    'Private beach dinner contribution',
    'Snorkeling excursion for two',
    'Cooking class for two',
    'City food tour contribution',
  ],
  'cash-funds': [
    'New home down payment fund',
    'Furniture fund contribution',
    'Honeymoon travel fund',
    'Wedding gift — any amount',
    'Emergency savings fund',
    'Date night fund',
    'Home renovation fund',
    'Charity donation in our name',
  ],
}

const BRAND_POOL = [
  { name: 'Serengeti Home Co.', location: 'Dar es Salaam' },
  { name: 'Kilimanjaro Kitchenware', location: 'Arusha' },
  { name: 'Coastal Linen Studio', location: 'Zanzibar' },
  { name: 'Dar Design House', location: 'Dar es Salaam' },
  { name: 'Highland Living', location: 'Moshi' },
  { name: 'Bagamoyo Ceramics', location: 'Bagamoyo' },
  { name: 'Mwanza Home Market', location: 'Mwanza' },
  { name: 'Tanga Trading Co.', location: 'Tanga' },
]

const HIGHLIGHT_POOL = [
  'A registry favourite — most requested in this category',
  'Ships within 3–5 business days',
  'Backed by a 1-year quality guarantee',
  'Easy to exchange for something else from the same store',
  'Comes beautifully gift-boxed, ready to give',
]

function seededPick<T>(pool: T[], seed: number): T {
  return pool[seed % pool.length]
}

function ratingFor(seed: number): string {
  const options = ['4.6', '4.7', '4.8', '4.9', '5.0']
  return seededPick(options, seed)
}

function badgeFor(seed: number): Product['badge'] {
  const m = seed % 5
  if (m === 0) return 'Bestseller'
  if (m === 1) return "OpusFesta's Pick"
  if (m === 2) return 'Most Wanted'
  return undefined
}

/** Deterministically builds product #`id` (1-indexed within its category) so PDP and listing pages always agree on the same product for a given id. */
export function generateProduct(categorySlug: string, id: number): Product | null {
  const category = getRegistryCategory(categorySlug)
  if (!category) return null
  const names = PRODUCT_NAMES[categorySlug] ?? []
  const name = names[(id - 1) % names.length]
  if (!name) return null

  const seed = id * 7 + categorySlug.length
  const tier = seededPick(PRICE_TIERS, seed)
  const pool = poolFor(categorySlug)
  const img = seededPick(pool, seed)
  const gallery = [img, seededPick(pool, seed + 1), seededPick(pool, seed + 2)].filter(
    (v, i, arr) => arr.indexOf(v) === i,
  )
  const brand = seededPick(BRAND_POOL, seed)
  const badge = badgeFor(seed)
  const colors = COLORS_BY_SLUG[categorySlug]

  return {
    id,
    name,
    price: tier.price,
    priceTzs: tier.priceTzs,
    oldPrice: tier.oldPrice,
    oldPriceTzs: tier.oldPriceTzs,
    rating: ratingFor(seed),
    reviews: 40 + ((seed * 37) % 900),
    img,
    gallery,
    badge,
    mostWanted: badge === 'Most Wanted',
    category,
    brand,
    description: `${name} from ${brand.name}, a registry favourite for couples starting their new home together.`,
    highlights: [HIGHLIGHT_POOL[seed % HIGHLIGHT_POOL.length], HIGHLIGHT_POOL[(seed + 1) % HIGHLIGHT_POOL.length]],
    colors,
  }
}

export function listProducts(categorySlug: string, limit: number, offset = 0): Product[] {
  const names = PRODUCT_NAMES[categorySlug] ?? []
  const products: Product[] = []
  for (let i = offset; i < offset + limit; i++) {
    const id = (i % names.length) + 1
    const p = generateProduct(categorySlug, id)
    if (p) products.push({ ...p, id: i + 1 })
  }
  return products
}

export function generateAllParams(): { category: string; id: string }[] {
  return REGISTRY_CATEGORIES.flatMap((c) => {
    const names = PRODUCT_NAMES[c.slug] ?? []
    return names.map((_, i) => ({ category: c.slug, id: String(i + 1) }))
  })
}

export type Collection = { id: string; title: string; image: string; href: string }

export const REGISTRY_COLLECTIONS: Collection[] = [
  { id: 'essentials', title: 'Registry Essentials', image: IMG.kitchen, href: '/registry/kitchen-dining' },
  { id: 'guests-love', title: 'Gifts Guests Love to Give', image: IMG.giftBoxPink, href: '/registry/cash-funds' },
  { id: 'top-rated', title: 'Top Rated Products', image: IMG.sofa, href: '/registry/furniture-decor' },
  { id: 'kitchen-essentials', title: 'Ultimate Kitchen Essentials', image: IMG.dinnerware, href: '/registry/kitchen-dining' },
  { id: 'build-your-bar', title: 'Build Your Bar', image: IMG.wineGlass, href: '/registry/tabletop-bar' },
  { id: 'weekend-ready', title: 'Weekend Ready', image: IMG.coconutBeach, href: '/registry/outdoor-weekend' },
]

export type Brand = { name: string }

export const REGISTRY_BRANDS: Brand[] = BRAND_POOL.map((b) => ({ name: b.name }))

export type PriceBand = { id: string; label: string; maxTzs: number }

export const PRICE_BANDS: PriceBand[] = [
  { id: 'under-50k', label: 'Gifts Under TZS 50,000', maxTzs: 50_000 },
  { id: 'under-150k', label: 'Gifts Under TZS 150,000', maxTzs: 150_000 },
  { id: 'under-350k', label: 'Gifts Under TZS 350,000', maxTzs: 350_000 },
]

export function productsUnder(maxTzs: number, limit = 6): Product[] {
  const all = REGISTRY_CATEGORIES.flatMap((c) => listProducts(c.slug, PRODUCT_NAMES[c.slug]?.length ?? 0))
  return all.filter((p) => p.priceTzs <= maxTzs).slice(0, limit)
}

export function mostPopularProducts(limit = 9): Product[] {
  const all = REGISTRY_CATEGORIES.flatMap((c) => listProducts(c.slug, PRODUCT_NAMES[c.slug]?.length ?? 0))
  return all
    .slice()
    .sort((a, b) => Number(b.mostWanted) - Number(a.mostWanted) || b.reviews - a.reviews)
    .slice(0, limit)
}

export function newArrivals(limit = 8): Product[] {
  const all = REGISTRY_CATEGORIES.flatMap((c) => listProducts(c.slug, PRODUCT_NAMES[c.slug]?.length ?? 0))
  return all.slice(-limit).reverse()
}
