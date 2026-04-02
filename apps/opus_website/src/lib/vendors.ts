export type VendorCategoryId =
  | 'venues'
  | 'photographers'
  | 'videographers'
  | 'djs-bands'
  | 'florists'
  | 'caterers'
  | 'hair-makeup'
  | 'wedding-cakes'
  | 'transportation'

export type Vendor = {
  id: string
  slug: string
  name: string
  excerpt: string
  category: string
  categoryId: VendorCategoryId
  city: string
  priceRange: string
  rating: number
  reviewCount: number
  badge?: 'Top Rated' | 'New' | 'Verified'
  featured?: boolean
  heroMedia: {
    type: 'image' | 'video'
    src: string
    alt: string
    poster?: string
  }
}

export type VendorCategory = {
  id: VendorCategoryId
  label: string
}

export type VendorCity = {
  id: string
  label: string
  vendorCount: number
  image: string
}

export const VENDORS_BASE_PATH = '/vendors'

export const vendorCategories: VendorCategory[] = [
  { id: 'venues', label: 'Venues' },
  { id: 'photographers', label: 'Photographers' },
  { id: 'videographers', label: 'Videographers' },
  { id: 'djs-bands', label: 'DJs & Bands' },
  { id: 'florists', label: 'Florists' },
  { id: 'caterers', label: 'Caterers' },
  { id: 'hair-makeup', label: 'Hair & Makeup' },
  { id: 'wedding-cakes', label: 'Wedding Cakes' },
  { id: 'transportation', label: 'Transportation' },
]

export const vendorCities: VendorCity[] = [
  {
    id: 'dar-es-salaam',
    label: 'Dar es Salaam',
    vendorCount: 312,
    image: '/assets/images/coupleswithpiano.jpg',
  },
  {
    id: 'zanzibar',
    label: 'Zanzibar',
    vendorCount: 187,
    image: '/assets/images/bride_umbrella.jpg',
  },
  {
    id: 'arusha',
    label: 'Arusha',
    vendorCount: 94,
    image: '/assets/images/authentic_couple.jpg',
  },
  {
    id: 'mwanza',
    label: 'Mwanza',
    vendorCount: 61,
    image: '/assets/images/churchcouples.jpg',
  },
  {
    id: 'moshi',
    label: 'Moshi',
    vendorCount: 48,
    image: '/assets/images/cutesy_couple.jpg',
  },
  {
    id: 'dodoma',
    label: 'Dodoma',
    vendorCount: 37,
    image: '/assets/images/couples_together.jpg',
  },
]

export const vendors: Vendor[] = [
  // Featured / spotlight
  {
    id: 'zanzibar-pearl-venue',
    slug: 'zanzibar-pearl-venue',
    name: 'The Zanzibar Pearl',
    excerpt:
      'An oceanfront venue with open-air pavilions, private beaches, and a team that handles every detail with quiet precision.',
    category: 'Venues',
    categoryId: 'venues',
    city: 'Zanzibar',
    priceRange: 'TZS 28M – 60M',
    rating: 4.9,
    reviewCount: 84,
    badge: 'Top Rated',
    featured: true,
    heroMedia: {
      type: 'image',
      src: '/assets/images/coupleswithpiano.jpg',
      alt: 'Couple at an elegant oceanfront wedding venue',
    },
  },
  {
    id: 'nia-photography',
    slug: 'nia-photography',
    name: 'Nia K. Photography',
    excerpt:
      'Editorial documentary photography that captures atmosphere, not just moments. Based in Dar, available across East Africa.',
    category: 'Photographers',
    categoryId: 'photographers',
    city: 'Dar es Salaam',
    priceRange: 'TZS 7M – 14M',
    rating: 5.0,
    reviewCount: 56,
    badge: 'Top Rated',
    featured: true,
    heroMedia: {
      type: 'image',
      src: '/assets/images/brideincar.jpg',
      alt: 'Bride portrait by Nia K. Photography',
    },
  },
  {
    id: 'serengeti-sounds',
    slug: 'serengeti-sounds',
    name: 'Serengeti Sounds',
    excerpt:
      'A live band and DJ hybrid that reads the room and keeps energy exactly where it needs to be from cocktails through last dance.',
    category: 'DJs & Bands',
    categoryId: 'djs-bands',
    city: 'Arusha',
    priceRange: 'TZS 4M – 9M',
    rating: 4.8,
    reviewCount: 43,
    badge: 'Verified',
    featured: true,
    heroMedia: {
      type: 'image',
      src: '/assets/images/mauzo_crew.jpg',
      alt: 'Band performing at a wedding celebration',
    },
  },

  // Venues section
  {
    id: 'kilimanjaro-gardens',
    slug: 'kilimanjaro-gardens',
    name: 'Kilimanjaro Gardens',
    excerpt:
      'Lush highland gardens with mountain views, a candlelit barn, and capacity for up to 400 guests.',
    category: 'Venues',
    categoryId: 'venues',
    city: 'Moshi',
    priceRange: 'TZS 18M – 38M',
    rating: 4.7,
    reviewCount: 61,
    badge: 'Verified',
    heroMedia: {
      type: 'image',
      src: '/assets/images/flowers_pinky.jpg',
      alt: 'Lush garden wedding venue with floral decor',
    },
  },
  {
    id: 'dar-rooftop-terrace',
    slug: 'dar-rooftop-terrace',
    name: 'The Dar Rooftop Terrace',
    excerpt:
      'A downtown rooftop with panoramic city-and-ocean views, a private bar, and a modern industrial-meets-elegant aesthetic.',
    category: 'Venues',
    categoryId: 'venues',
    city: 'Dar es Salaam',
    priceRange: 'TZS 22M – 45M',
    rating: 4.6,
    reviewCount: 38,
    badge: 'New',
    heroMedia: {
      type: 'image',
      src: '/assets/images/authentic_couple.jpg',
      alt: 'Couple at a rooftop wedding venue in Dar es Salaam',
    },
  },

  // Photographers
  {
    id: 'amani-lens',
    slug: 'amani-lens',
    name: 'Amani Lens Studio',
    excerpt:
      'Warm, cinematic imagery with a focus on candid emotion. Package includes full-day coverage and an edited gallery in 3 weeks.',
    category: 'Photographers',
    categoryId: 'photographers',
    city: 'Zanzibar',
    priceRange: 'TZS 6M – 11M',
    rating: 4.9,
    reviewCount: 72,
    badge: 'Top Rated',
    heroMedia: {
      type: 'image',
      src: '/assets/images/beautiful_bride.jpg',
      alt: 'Beautifully lit bridal portrait',
    },
  },
  {
    id: 'golden-hour-studios',
    slug: 'golden-hour-studios',
    name: 'Golden Hour Studios',
    excerpt:
      'Specialising in outdoor and destination weddings with natural light and a muted editorial finish.',
    category: 'Photographers',
    categoryId: 'photographers',
    city: 'Arusha',
    priceRange: 'TZS 5M – 9M',
    rating: 4.7,
    reviewCount: 29,
    badge: 'Verified',
    heroMedia: {
      type: 'image',
      src: '/assets/images/bridering.jpg',
      alt: 'Engagement ring photography',
    },
  },

  // Videographers
  {
    id: 'frame-and-feel',
    slug: 'frame-and-feel',
    name: 'Frame & Feel Films',
    excerpt:
      'Cinematic wedding films with drone coverage, same-day edits, and full ceremony documentation.',
    category: 'Videographers',
    categoryId: 'videographers',
    city: 'Dar es Salaam',
    priceRange: 'TZS 5M – 12M',
    rating: 4.8,
    reviewCount: 47,
    badge: 'Top Rated',
    heroMedia: {
      type: 'video',
      src: '/assets/videos/happy_couples.mov',
      poster: '/assets/images/couples_together.jpg',
      alt: 'Wedding film still from Frame & Feel Films',
    },
  },
  {
    id: 'safari-cinema',
    slug: 'safari-cinema',
    name: 'Safari Cinema',
    excerpt:
      'Feature-style wedding documentaries for destination and outdoor ceremonies. Based in Arusha.',
    category: 'Videographers',
    categoryId: 'videographers',
    city: 'Arusha',
    priceRange: 'TZS 6M – 14M',
    rating: 4.6,
    reviewCount: 22,
    badge: 'Verified',
    heroMedia: {
      type: 'image',
      src: '/assets/images/cutesy_couple.jpg',
      alt: 'Couple during a cinematic outdoor shoot',
    },
  },

  // Florists
  {
    id: 'bloom-collective',
    slug: 'bloom-collective',
    name: 'The Bloom Collective',
    excerpt:
      'Full décor and floristry with a signature style: sculptural arches, lush tablescapes, and ceremony installations.',
    category: 'Florists',
    categoryId: 'florists',
    city: 'Dar es Salaam',
    priceRange: 'TZS 4M – 16M',
    rating: 4.9,
    reviewCount: 65,
    badge: 'Top Rated',
    heroMedia: {
      type: 'image',
      src: '/assets/images/flowers_pinky.jpg',
      alt: 'Lush floral wedding installation',
    },
  },

  // Caterers
  {
    id: 'spice-route-catering',
    slug: 'spice-route-catering',
    name: 'Spice Route Catering',
    excerpt:
      'Swahili-fusion menus for 80 to 500 guests. Free tasting sessions, full service staff, and custom menu design.',
    category: 'Caterers',
    categoryId: 'caterers',
    city: 'Zanzibar',
    priceRange: 'TZS 12M – 35M',
    rating: 4.8,
    reviewCount: 91,
    badge: 'Top Rated',
    heroMedia: {
      type: 'image',
      src: '/assets/images/churchcouples.jpg',
      alt: 'Guests at a beautifully catered wedding reception',
    },
  },

  // Hair & Makeup
  {
    id: 'luminary-glam',
    slug: 'luminary-glam',
    name: 'Luminary Glam Studio',
    excerpt:
      'Bridal hair and makeup with a polished editorial finish. Trials included with every full-day package.',
    category: 'Hair & Makeup',
    categoryId: 'hair-makeup',
    city: 'Dar es Salaam',
    priceRange: 'TZS 1.5M – 4M',
    rating: 4.8,
    reviewCount: 58,
    badge: 'Top Rated',
    heroMedia: {
      type: 'image',
      src: '/assets/images/beautyinbride.jpg',
      alt: 'Bride with polished hair and makeup on wedding day',
    },
  },
  {
    id: 'glow-collective',
    slug: 'glow-collective',
    name: 'Glow Collective',
    excerpt:
      'A mobile beauty team serving the whole bridal party. Available across Zanzibar and the mainland.',
    category: 'Hair & Makeup',
    categoryId: 'hair-makeup',
    city: 'Zanzibar',
    priceRange: 'TZS 2M – 5M',
    rating: 4.7,
    reviewCount: 41,
    badge: 'Verified',
    heroMedia: {
      type: 'image',
      src: '/assets/images/bridewithumbrella.jpg',
      alt: 'Bridal party ready for the wedding day',
    },
  },

  // DJs & Bands
  {
    id: 'rhythm-house',
    slug: 'rhythm-house',
    name: 'Rhythm House',
    excerpt:
      "Dar's top wedding DJ: curated playlists, seamless transitions, and a light rig that transforms any room after dark.",
    category: 'DJs & Bands',
    categoryId: 'djs-bands',
    city: 'Dar es Salaam',
    priceRange: 'TZS 2.5M – 7M',
    rating: 4.9,
    reviewCount: 112,
    badge: 'Top Rated',
    heroMedia: {
      type: 'image',
      src: '/assets/images/mauzo_crew.jpg',
      alt: 'DJ performing at an energetic wedding reception',
    },
  },
  {
    id: 'east-africa-sounds',
    slug: 'east-africa-sounds',
    name: 'East Africa Sounds',
    excerpt:
      'Afrobeats, Bongo Flava, and international sets — a three-piece live band that keeps the dance floor moving all night.',
    category: 'DJs & Bands',
    categoryId: 'djs-bands',
    city: 'Zanzibar',
    priceRange: 'TZS 5M – 11M',
    rating: 4.7,
    reviewCount: 39,
    badge: 'Verified',
    heroMedia: {
      type: 'image',
      src: '/assets/images/churchcouples.jpg',
      alt: 'Live band at a wedding celebration',
    },
  },

  // Florists
  {
    id: 'petals-and-palms',
    slug: 'petals-and-palms',
    name: 'Petals & Palms',
    excerpt:
      'Tropical floristry with a modern edit. Known for dramatic ceremony arches, boutonnieres, and overflowing tablescapes.',
    category: 'Florists',
    categoryId: 'florists',
    city: 'Dar es Salaam',
    priceRange: 'TZS 3M – 10M',
    rating: 4.8,
    reviewCount: 47,
    badge: 'Verified',
    heroMedia: {
      type: 'image',
      src: '/assets/images/flowers_pinky.jpg',
      alt: 'Tropical floral wedding arrangement',
    },
  },
  {
    id: 'wild-bloom-studio',
    slug: 'wild-bloom-studio',
    name: 'Wild Bloom Studio',
    excerpt:
      'Garden-style floristry with an organic, slightly undone feel. Specialises in outdoor and highland ceremonies.',
    category: 'Florists',
    categoryId: 'florists',
    city: 'Arusha',
    priceRange: 'TZS 2.5M – 8M',
    rating: 4.6,
    reviewCount: 28,
    badge: 'New',
    heroMedia: {
      type: 'image',
      src: '/assets/images/hand_rings.jpg',
      alt: 'Delicate floral details at a garden wedding',
    },
  },

  // Caterers
  {
    id: 'boma-kitchen',
    slug: 'boma-kitchen',
    name: 'Boma Kitchen',
    excerpt:
      'East African cuisine at its most celebratory. Buffet and plated service for 50 to 800 guests, with a full bar package option.',
    category: 'Caterers',
    categoryId: 'caterers',
    city: 'Arusha',
    priceRange: 'TZS 8M – 22M',
    rating: 4.7,
    reviewCount: 63,
    badge: 'Verified',
    heroMedia: {
      type: 'image',
      src: '/assets/images/couples_together.jpg',
      alt: 'Catered wedding reception with guests enjoying the meal',
    },
  },
  {
    id: 'coastal-table',
    slug: 'coastal-table',
    name: 'Coastal Table',
    excerpt:
      'Seafood-led menus with Swahili spice influence. Perfect for beachfront and outdoor receptions up to 300 guests.',
    category: 'Caterers',
    categoryId: 'caterers',
    city: 'Moshi',
    priceRange: 'TZS 10M – 28M',
    rating: 4.8,
    reviewCount: 44,
    badge: 'Top Rated',
    heroMedia: {
      type: 'image',
      src: '/assets/images/cutesy_couple.jpg',
      alt: 'Outdoor coastal wedding reception',
    },
  },
]

export function getVendorsByCategory(categoryId: VendorCategoryId) {
  return vendors.filter((v) => v.categoryId === categoryId)
}

export function getFeaturedVendors() {
  return vendors.filter((v) => v.featured)
}

export function getVendor(slug: string) {
  return vendors.find((vendor) => vendor.slug === slug)
}
