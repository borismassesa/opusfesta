import { BRIDAL_CATEGORIES, getBridalCategory, type BridalCategory } from './bridal-categories'

export type SwatchColor = { name: string; swatch: string }

export type ProductReview = {
  id: string
  author: string
  city: string
  rating: number
  date: string
  text: string
  weddingDate?: string
  media?: { type: 'photo' | 'video'; src: string; poster?: string }[]
}

export type Product = {
  id: number
  name: string
  price: string
  priceTzs: number
  oldPrice?: string
  oldPriceTzs?: number
  discountPct?: number
  rating: string
  reviews: number
  sold: number
  img: string
  gallery: string[]
  badge?: 'Bestseller' | "OpusFesta's Pick"
  freeDelivery: boolean
  category: BridalCategory
  vendor: {
    name: string
    location: string
    rating: string
    reviews: number
    yearsActive: number
  }
  description: string
  highlights: string[]
  materials: string[]
  madeIn: string
  options: { sizes: string[]; colors: SwatchColor[]; lengths?: string[] }
  reviewSnippets: ProductReview[]
  deliveryFeeTzs: number
}

const IMG = {
  dress: 'https://images.unsplash.com/photo-1595777457583-95e059d581b8?auto=format&fit=crop&w=1200&q=80',
  ring: 'https://images.unsplash.com/photo-1511285560929-80b456fea0bc?auto=format&fit=crop&w=1200&q=80',
  band: 'https://images.unsplash.com/photo-1515934751635-c81c6bc9a2d8?auto=format&fit=crop&w=1200&q=80',
  suit: 'https://images.unsplash.com/photo-1593030761757-71fae45fa0e7?auto=format&fit=crop&w=1200&q=80',
  shoes: 'https://images.unsplash.com/photo-1543163521-1bf539c55dd2?auto=format&fit=crop&w=1200&q=80',
  veil: 'https://images.unsplash.com/photo-1606800052052-a08af7148866?auto=format&fit=crop&w=1200&q=80',
  bridesmaids: 'https://images.unsplash.com/photo-1591604466107-ec97de577aff?auto=format&fit=crop&w=1200&q=80',
  watch: 'https://images.unsplash.com/photo-1523275335684-37898b6baf30?auto=format&fit=crop&w=1200&q=80',
  ties: 'https://images.unsplash.com/photo-1589756823695-278bc923f962?auto=format&fit=crop&w=1200&q=80',
  reception: 'https://images.unsplash.com/photo-1519225421980-715cb0215aed?auto=format&fit=crop&w=1200&q=80',
  vintage: 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?auto=format&fit=crop&w=1200&q=80',
  gifts: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?auto=format&fit=crop&w=1200&q=80',
}

const IMG_POOL = Object.values(IMG)

const CATEGORY_IMG_POOL: Record<string, string[]> = {
  'bridal-trends': [IMG.dress, IMG.veil, IMG.bridesmaids, IMG.shoes],
  'engagement-rings': [IMG.ring, IMG.band],
  'wedding-bands': [IMG.band, IMG.ring],
  'wedding-dresses': [IMG.dress, IMG.bridesmaids, IMG.veil],
  'veils-and-headpieces': [IMG.veil, IMG.bridesmaids],
  'bridal-shoes': [IMG.shoes],
  'groom-suits': [IMG.suit],
  'groomsmen-looks': [IMG.suit, IMG.ties, IMG.watch],
  'bridesmaid-dresses': [IMG.bridesmaids, IMG.dress],
  'mens-watches': [IMG.watch],
  'vintage-bridal-finds': [IMG.dress, IMG.veil, IMG.ring, IMG.vintage],
  'bridal-party-gifts': [IMG.gifts, IMG.watch, IMG.ring],
  'custom-tailoring': [IMG.suit, IMG.dress],
  'wedding-jewellery': [IMG.ring, IMG.band, IMG.veil],
  'reception-looks': [IMG.reception, IMG.dress, IMG.bridesmaids],
}

function poolFor(categorySlug: string): string[] {
  return CATEGORY_IMG_POOL[categorySlug] ?? IMG_POOL
}

const METAL_COLORS: SwatchColor[] = [
  { name: 'Yellow gold', swatch: '#d4af37' },
  { name: 'Rose gold', swatch: '#b76e79' },
  { name: 'White gold', swatch: '#e8e8e8' },
  { name: 'Platinum', swatch: '#cdcdcd' },
]

const BRIDAL_COLORS: SwatchColor[] = [
  { name: 'Ivory', swatch: '#fffff0' },
  { name: 'Champagne', swatch: '#f7e7ce' },
  { name: 'Blush', swatch: '#ffd1dc' },
]

const SUIT_COLORS: SwatchColor[] = [
  { name: 'Charcoal', swatch: '#36454f' },
  { name: 'Navy', swatch: '#1c2e4a' },
  { name: 'Black', swatch: '#0d0d0d' },
  { name: 'Burgundy', swatch: '#722f37' },
]

const SHOE_COLORS: SwatchColor[] = [
  { name: 'Ivory', swatch: '#fffff0' },
  { name: 'Champagne', swatch: '#f7e7ce' },
  { name: 'Silver', swatch: '#c0c0c0' },
]

const WATCH_COLORS: SwatchColor[] = [
  { name: 'Silver', swatch: '#c0c0c0' },
  { name: 'Gold', swatch: '#d4af37' },
  { name: 'Black', swatch: '#0d0d0d' },
]

const VEIL_COLORS: SwatchColor[] = [
  { name: 'Ivory', swatch: '#fffff0' },
  { name: 'White', swatch: '#ffffff' },
]

const COLORS_BY_SLUG: Record<string, SwatchColor[]> = {
  'engagement-rings': METAL_COLORS,
  'wedding-bands': METAL_COLORS,
  'wedding-jewellery': METAL_COLORS,
  'mens-watches': WATCH_COLORS,
  'wedding-dresses': BRIDAL_COLORS,
  'bridesmaid-dresses': [
    { name: 'Sage', swatch: '#9caf88' },
    { name: 'Dusty rose', swatch: '#dcae96' },
    { name: 'Champagne', swatch: '#f7e7ce' },
    { name: 'Mocha', swatch: '#6f4e37' },
  ],
  'bridal-shoes': SHOE_COLORS,
  'groom-suits': SUIT_COLORS,
  'groomsmen-looks': SUIT_COLORS,
  'veils-and-headpieces': VEIL_COLORS,
  'vintage-bridal-finds': [
    { name: 'Ivory', swatch: '#fffff0' },
    { name: 'Ecru', swatch: '#c2b280' },
    { name: 'Champagne', swatch: '#f7e7ce' },
  ],
  'bridal-party-gifts': [
    { name: 'Silver', swatch: '#c0c0c0' },
    { name: 'Gold', swatch: '#d4af37' },
    { name: 'Rose gold', swatch: '#b76e79' },
  ],
  'custom-tailoring': SUIT_COLORS,
  'bridal-trends': BRIDAL_COLORS,
  'reception-looks': [
    { name: 'Ivory', swatch: '#fffff0' },
    { name: 'Champagne', swatch: '#f7e7ce' },
    { name: 'Black', swatch: '#0d0d0d' },
  ],
}

const SIZES_BY_SLUG: Record<string, string[]> = {
  'engagement-rings': ['5', '6', '7', '8', '9', '10', '11', '12'],
  'wedding-bands': ['5', '6', '7', '8', '9', '10', '11', '12'],
  'wedding-jewellery': ['One size'],
  'mens-watches': ['38mm', '40mm', '42mm', '44mm'],
  'bridal-shoes': ['36', '37', '38', '39', '40', '41', '42'],
  'groom-suits': ['36', '38', '40', '42', '44', '46', 'Custom'],
  'groomsmen-looks': ['36', '38', '40', '42', '44', '46'],
  'wedding-dresses': ['XS', 'S', 'M', 'L', 'XL', 'Custom'],
  'bridesmaid-dresses': ['XS', 'S', 'M', 'L', 'XL'],
  'veils-and-headpieces': ['Fingertip', 'Chapel', 'Cathedral'],
  'vintage-bridal-finds': ['XS', 'S', 'M', 'L'],
  'bridal-party-gifts': ['One size'],
  'custom-tailoring': ['Made-to-measure'],
  'bridal-trends': ['XS', 'S', 'M', 'L', 'XL'],
  'reception-looks': ['XS', 'S', 'M', 'L', 'XL'],
}

const PRICE_TIERS: { price: string; priceTzs: number; oldPrice?: string; oldPriceTzs?: number }[] = [
  { price: 'TZS 1,450,000', priceTzs: 1_450_000, oldPrice: 'TZS 1,800,000', oldPriceTzs: 1_800_000 },
  { price: 'TZS 240,000', priceTzs: 240_000 },
  { price: 'TZS 3,200,000', priceTzs: 3_200_000 },
  { price: 'TZS 890,000', priceTzs: 890_000, oldPrice: 'TZS 1,050,000', oldPriceTzs: 1_050_000 },
  { price: 'TZS 165,000', priceTzs: 165_000 },
  { price: 'TZS 320,000', priceTzs: 320_000 },
  { price: 'TZS 1,150,000', priceTzs: 1_150_000, oldPrice: 'TZS 1,500,000', oldPriceTzs: 1_500_000 },
  { price: 'TZS 95,000', priceTzs: 95_000 },
  { price: 'TZS 760,000', priceTzs: 760_000 },
  { price: 'TZS 980,000', priceTzs: 980_000, oldPrice: 'TZS 1,400,000', oldPriceTzs: 1_400_000 },
  { price: 'TZS 175,000', priceTzs: 175_000 },
  { price: 'TZS 720,000', priceTzs: 720_000, oldPrice: 'TZS 870,000', oldPriceTzs: 870_000 },
  { price: 'TZS 85,000', priceTzs: 85_000 },
  { price: 'TZS 110,000', priceTzs: 110_000 },
  { price: 'TZS 420,000', priceTzs: 420_000 },
  { price: 'TZS 65,000', priceTzs: 65_000 },
]

const PRODUCT_NAMES: Record<string, string[]> = {
  'bridal-trends': [
    'Beaded illusion-neckline bridal gown',
    'Pearl-trimmed bridal slip dress',
    'Hand-pressed silk floral hair vine',
    'Champagne-tinted bridal slingbacks',
    'Cathedral lace mantilla veil',
    'Curated bridal trousseau box',
    'Mother-of-pearl statement earrings',
    'Asymmetric satin tea-length gown',
    'Crystal-drop bridal hair pins set',
    'Embroidered tulle cape with train',
    'Modern slip-style ivory dress',
    'Hand-painted bridal silk robe',
    'Pearl-and-gold bridal bangle stack',
    'Minimalist gold bridal headband',
    'Bridal monogram clutch in satin',
    'Hand-tied dried floral crown',
  ],
  'engagement-rings': [
    'Round-cut solitaire diamond ring',
    'Oval halo with pavé band',
    'Cushion-cut three-stone ring',
    'Emerald-cut bezel set ring',
    'Pear-shaped diamond with hidden halo',
    'Princess-cut split-shank ring',
    'Marquise yellow-gold ring',
    'Asscher-cut platinum ring',
    'Vintage-inspired filigree ring',
    'Two-tone twisted solitaire',
    'Toi et moi double-stone ring',
    'East-west oval engagement ring',
    'Channel-set diamond eternity',
    'Heart-shaped solitaire ring',
    'Custom lab-grown diamond ring',
    'Sapphire centre-stone ring',
  ],
  'wedding-bands': [
    'Pavé eternity diamond band',
    'Classic 18k gold comfort band',
    'Milgrain-edge platinum band',
    'Hand-engraved Celtic band',
    'Two-tone interlocking band',
    'Hammered matte gold band',
    'Channel-set sapphire band',
    'Stackable thin gold bands set of 3',
    "Brushed-finish men's tungsten band",
    'Diamond half-eternity band',
    'Sculpted wave wedding band',
    'Polished palladium classic band',
    'Vintage-inspired engraved band',
    'Floating diamond accent band',
    'Custom rose-gold curved band',
    'Bezel-set diamond band',
  ],
  'wedding-dresses': [
    'A-line lace bridal gown',
    'Mermaid silhouette satin gown',
    'Ball gown with cathedral train',
    'Sheath crepe minimalist dress',
    'Tea-length 1950s-inspired dress',
    'Boho off-shoulder gown',
    'Two-piece bridal separates',
    'Modern square-neck gown',
    'Beaded bodice ballgown',
    'Backless silk slip dress',
    'Long-sleeve lace gown',
    'High-low ruffled gown',
    'Convertible overskirt gown',
    'Empire-waist Grecian gown',
    'Fit-and-flare with bow detail',
    'Custom-made bespoke gown',
  ],
}

const VENDOR_POOL = [
  { name: 'Dar Bridal Atelier', location: 'Dar es Salaam', rating: '4.9', reviews: 1207, yearsActive: 8 },
  { name: 'Zanzibar Heritage Jewellers', location: 'Zanzibar', rating: '4.8', reviews: 842, yearsActive: 14 },
  { name: 'Kilimanjaro Couture', location: 'Moshi', rating: '4.9', reviews: 503, yearsActive: 6 },
  { name: 'Arusha Diamond House', location: 'Arusha', rating: '4.7', reviews: 1485, yearsActive: 12 },
  { name: 'Mwanza Bridal Studio', location: 'Mwanza', rating: '4.8', reviews: 386, yearsActive: 5 },
  { name: 'Bagamoyo Goldsmiths', location: 'Bagamoyo', rating: '4.9', reviews: 921, yearsActive: 17 },
  { name: 'Dodoma Tailoring Co.', location: 'Dodoma', rating: '4.6', reviews: 217, yearsActive: 4 },
  { name: 'Coastal Veil & Lace', location: 'Pangani', rating: '4.9', reviews: 654, yearsActive: 9 },
  { name: 'Moshi Master Tailors', location: 'Moshi', rating: '4.8', reviews: 1108, yearsActive: 21 },
  { name: 'Tanga Treasures', location: 'Tanga', rating: '4.7', reviews: 332, yearsActive: 7 },
]

const REVIEW_POOL: { author: string; city: string; text: string }[] = [
  { author: 'Asha M.', city: 'Dar es Salaam', text: 'Beautiful piece. The boutique was patient and let us do two fittings before the wedding. We picked it up two weeks before the day and it was packaged so carefully.' },
  { author: 'Joseph K.', city: 'Arusha', text: 'Arrived in perfect condition. Customer service was excellent and they accept M-Pesa for the deposit, which made everything easier. Will recommend to friends.' },
  { author: 'Neema T.', city: 'Mwanza', text: 'Worth every shilling. The fit was spot-on after one alteration and the team was so kind. Photos really do not do it justice.' },
  { author: 'Salima H.', city: 'Zanzibar', text: 'Beyond what we expected for the price. Will recommend to my cousins planning their weddings. The vendor messaged me directly to check the fit a day before pickup.' },
  { author: 'David O.', city: 'Dodoma', text: 'Came faster than promised. Quality is genuinely premium. The certificate of authenticity is a nice touch.' },
  { author: 'Grace P.', city: 'Moshi', text: 'My maid of honour cried when she saw it. The detail is incredible — every stitch is exactly where it should be.' },
  { author: 'Ibrahim S.', city: 'Tanga', text: 'Fairly priced and the tailor explained every step of the fitting. Felt like a five-star experience for half what the high-street studios were quoting.' },
  { author: 'Rehema J.', city: 'Bagamoyo', text: 'Packaged with so much care. Felt like a real luxury experience and the after-care messages were a lovely surprise.' },
  { author: 'Faith N.', city: 'Dar es Salaam', text: 'I had so many questions and they answered every one within hours. The final piece looked just like the reference photos I sent.' },
  { author: 'Peter L.', city: 'Arusha', text: 'Solid build, clean finish, and the size guide was accurate. Took it home the same day.' },
  { author: 'Zainab A.', city: 'Zanzibar', text: 'I was nervous ordering online but the studio walked me through every step. Three fittings, no extra cost.' },
  { author: 'Edward M.', city: 'Mwanza', text: 'Honestly the best money I have ever spent. Quality, service and the after-sales were all there.' },
]

const HIGHLIGHT_POOL = [
  'Crafted by a master maker',
  'Materials: 18k gold and natural stones',
  'Conflict-free, ethically sourced',
  'Can be personalised with initials',
  'Made to order — 4-week lead time',
  'Comes with a certificate of authenticity',
  'Free in-person fitting in Dar es Salaam',
  'Lifetime cleaning and minor repairs',
]

const DESCRIPTIONS: Record<string, string> = {
  'engagement-rings':
    'Designed for a lifetime of wear, this ring is hand-finished in a small Tanzanian atelier. The shank is comfort-curved, the centre stone is set by hand, and every piece passes a final inspection before it leaves the workshop. Pair it with one of our wedding bands or wear it solo.',
  'wedding-bands':
    'A timeless band finished to last — the inside is comfort-curved, the outside is hand-polished, and the metal weight is honest. Pair it with an engagement ring or wear it solo. Resizing is included in the price for the first six months.',
  'wedding-dresses':
    'A made-to-measure gown stitched by a local atelier. Every dress is cut from premium fabric and finished with hand-set beading. Two complimentary fittings are included so the silhouette is exactly right on your day.',
  'bridal-trends':
    'Selected this season by the OpusFesta editorial team for couples planning weddings in Tanzania and across the region. Versatile, well-made, and fairly priced.',
  'mens-watches':
    'A statement piece for the wedding day and the years that follow. Sapphire crystal, sapphire-coated bezel, and a movement built to be serviced — not replaced.',
}

function hash(str: string, salt: number): number {
  let h = salt
  for (let i = 0; i < str.length; i++) h = (h * 31 + str.charCodeAt(i)) >>> 0
  return h
}

export function generateProduct(categorySlug: string, id: number): Product | null {
  const category = getBridalCategory(categorySlug)
  if (!category) return null

  const namePool =
    PRODUCT_NAMES[categorySlug] ??
    Array.from({ length: 16 }, (_, i) => `${category.name} piece ${i + 1}`)

  const h = hash(categorySlug, id + 13)
  const name = namePool[id % namePool.length]
  const tier = PRICE_TIERS[(id + (h % 7)) % PRICE_TIERS.length]
  const pool = poolFor(categorySlug)
  const baseImg = pool[(id + (h % pool.length)) % pool.length]
  const gallery = Array.from({ length: 4 }, (_, i) => pool[(id + i + (h % pool.length)) % pool.length])
  const ratingNum = (4.5 + ((id + h) % 5) * 0.1).toFixed(1)
  const reviews = 24 + ((id * 17 + h) % 800)
  const sold = 200 + ((id * 31 + h) % 1500)
  const badge: Product['badge'] | undefined =
    id % 4 === 0 ? "OpusFesta's Pick" : id % 5 === 0 ? 'Bestseller' : undefined

  const vendor = VENDOR_POOL[(id + (h % 4)) % VENDOR_POOL.length]
  const highlights = [
    HIGHLIGHT_POOL[id % HIGHLIGHT_POOL.length],
    HIGHLIGHT_POOL[(id + 2) % HIGHLIGHT_POOL.length],
    HIGHLIGHT_POOL[(id + 4) % HIGHLIGHT_POOL.length],
    HIGHLIGHT_POOL[(id + 6) % HIGHLIGHT_POOL.length],
  ]
  const REVIEW_DATES = [
    '2 days ago', 'Last week', '2 weeks ago', '3 weeks ago', 'Last month',
    '6 weeks ago', '2 months ago', '3 months ago', '4 months ago', '5 months ago',
    '6 months ago', '8 months ago',
  ]
  const WEDDING_DATES = [
    'November 2025', 'October 2025', 'September 2025', 'August 2025', 'July 2025',
    'June 2025', 'May 2025', 'April 2025', 'March 2025', undefined, undefined, undefined,
  ]
  const reviewSnippets: ProductReview[] = Array.from({ length: 12 }, (_, i) => {
    const r = REVIEW_POOL[(id + i * 3) % REVIEW_POOL.length]
    const ratingSeed = (id + i * 5 + h) % 9
    const rating =
      ratingSeed < 6 ? 5 :
      ratingSeed < 8 ? 4 :
      ratingSeed === 8 ? 3 : 5
    const hasMedia = (id + i) % 3 === 0
    return {
      id: `${categorySlug}-${id}-r${i}`,
      author: r.author,
      city: r.city,
      text: r.text,
      rating,
      date: REVIEW_DATES[i % REVIEW_DATES.length],
      weddingDate: WEDDING_DATES[i % WEDDING_DATES.length],
      media: hasMedia
        ? [{ type: 'photo' as const, src: pool[(id + i) % pool.length] }]
        : undefined,
    }
  })

  const sizes = SIZES_BY_SLUG[categorySlug] ?? ['XS', 'S', 'M', 'L', 'XL']
  const colors = COLORS_BY_SLUG[categorySlug] ?? BRIDAL_COLORS

  const discountPct =
    tier.oldPriceTzs && tier.priceTzs < tier.oldPriceTzs
      ? Math.round((1 - tier.priceTzs / tier.oldPriceTzs) * 100)
      : undefined

  return {
    id,
    name,
    price: tier.price,
    priceTzs: tier.priceTzs,
    oldPrice: tier.oldPrice,
    oldPriceTzs: tier.oldPriceTzs,
    discountPct,
    rating: ratingNum,
    reviews,
    sold,
    img: baseImg,
    gallery,
    badge,
    freeDelivery: id % 3 === 0,
    category,
    vendor,
    description: DESCRIPTIONS[categorySlug] ?? DESCRIPTIONS['bridal-trends'],
    highlights,
    materials: ['Premium fabric or 18k metal', 'Natural stones where applicable', 'Made by hand'],
    madeIn: 'Tanzania',
    options: { sizes, colors },
    reviewSnippets,
    deliveryFeeTzs: id % 3 === 0 ? 0 : 12_000,
  }
}

export function listProductIds(categorySlug: string, count: number, offset: number = 0): number[] {
  return Array.from({ length: count }, (_, i) => i + offset)
}

export function listProducts(categorySlug: string, count: number, offset: number = 0): Product[] {
  const ids = listProductIds(categorySlug, count, offset)
  return ids
    .map((id) => generateProduct(categorySlug, id))
    .filter((p): p is Product => p !== null)
}

export function generateAllParams(): { category: string; id: string }[] {
  const out: { category: string; id: string }[] = []
  for (const c of BRIDAL_CATEGORIES) {
    for (let i = 0; i < 48; i++) {
      out.push({ category: c.slug, id: String(i) })
    }
  }
  return out
}
