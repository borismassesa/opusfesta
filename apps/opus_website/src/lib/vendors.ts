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
  | 'officiant-mc'
  | 'decor-styling'
  | 'wedding-planners'
  | 'invitations-stationery'
  | 'jewellery-rings'
  | 'bridal-wear'
  | 'sound-lighting'
  | 'groom-wear'
  | 'photo-booths'
  | 'honeymoon-travel'
  | 'tents-marquees'
  | 'security'
  | 'caricature-entertainment'

export type VendorAvailability = {
  bookedDates: string[]   // ISO date strings "YYYY-MM-DD"
  limitedDates: string[]  // ISO date strings "YYYY-MM-DD"
  leadTimeWeeks: number
}

export type VendorMediaItem = {
  type: 'photo' | 'video'
  src: string
  poster?: string
}

export type VendorReview = {
  id: string
  author: string
  rating: number
  text: string
  date: string
  weddingDate?: string
  media?: VendorMediaItem[]
}

export type VendorPricingPackage = {
  label: string
  value: string
  services?: string[]
  note?: string
}

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
  gallery?: string[]
  availability?: VendorAvailability
  // Extended profile fields (populated by vendors_portal)
  about?: string
  startingPrice?: string
  responseTime?: string
  locallyOwned?: boolean
  yearsInBusiness?: number
  languages?: string[]
  awards?: string[]
  capacity?: { min: number; max: number }
  services?: string[]
  pricingDetails?: VendorPricingPackage[]
  detailedReviews?: VendorReview[]
  faqs?: Array<{ question: string; answer: string }>
  location?: { address: string; lat: number; lng: number }
  serviceArea?: string[]
  team?: Array<{ avatar?: string; role?: string; name?: string; bio?: string }>
  socialLinks?: { instagram?: string; facebook?: string; website?: string }
}

/**
 * Generates deterministic demo availability for a vendor based on their id.
 * Used as a fallback when no real availability data is stored.
 */
export function generateAvailability(vendorId: string): VendorAvailability {
  const seed = vendorId.split('').reduce((acc, c) => acc + c.charCodeAt(0), 0)

  const bookedDates: string[] = []
  const limitedDates: string[] = []
  const now = new Date()

  for (let i = 7; i < 365; i++) {
    const d = new Date(now.getFullYear(), now.getMonth(), now.getDate() + i)
    const dow = d.getDay()
    // Only Saturdays and Sundays (typical wedding days)
    if (dow !== 0 && dow !== 6) continue
    const mixed = (seed * 31 + i * 17) % 100
    const ds = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`
    if (mixed < 18) {
      bookedDates.push(ds)
    } else if (mixed < 30) {
      limitedDates.push(ds)
    }
  }

  return {
    bookedDates,
    limitedDates,
    leadTimeWeeks: [2, 4, 6, 8][seed % 4],
  }
}

export type VendorCategory = {
  id: VendorCategoryId
  label: string
  count: number
}

export type VendorCity = {
  id: string
  label: string
  vendorCount: number
  image: string
}

export const VENDORS_BASE_PATH = '/vendors'

export const vendorCategories: VendorCategory[] = [
  { id: 'venues',                   label: 'Venues',                    count: 312 },
  { id: 'photographers',            label: 'Photographers',             count: 248 },
  { id: 'wedding-planners',         label: 'Wedding Planners',          count: 134 },
  { id: 'officiant-mc',             label: 'MC',                        count:  97 },
  { id: 'florists',                 label: 'Florists',                  count: 183 },
  { id: 'caterers',                 label: 'Caterers',                  count: 209 },
  { id: 'hair-makeup',              label: 'Hair & Makeup',             count: 176 },
  { id: 'wedding-cakes',            label: 'Wedding Cakes',             count: 118 },
  { id: 'transportation',           label: 'Transportation',            count:  74 },
  { id: 'djs-bands',                label: 'DJs & Bands',               count: 142 },
  { id: 'decor-styling',            label: 'Decor & Styling',           count: 161 },
  { id: 'videographers',            label: 'Videographers',             count: 195 },
  { id: 'invitations-stationery',   label: 'Invitations & Stationery',  count:  89 },
  { id: 'jewellery-rings',          label: 'Jewellery & Rings',         count:  63 },
  { id: 'bridal-wear',              label: 'Bridal Wear & Fashion',     count: 107 },
  { id: 'sound-lighting',           label: 'Sound & Lighting',          count:  81 },
  { id: 'groom-wear',               label: 'Groom Wear',                count:  58 },
  { id: 'photo-booths',             label: 'Photo Booths',              count:  44 },
  { id: 'honeymoon-travel',         label: 'Honeymoon & Travel',        count:  37 },
  { id: 'tents-marquees',           label: 'Tents & Marquees',          count:  52 },
  { id: 'security',                 label: 'Security',                  count:  29 },
  { id: 'caricature-entertainment', label: 'Caricature & Entertainment', count:  33 },
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

const baseVendors: Vendor[] = [
  // Featured / spotlight
  {
    id: 'zanzibar-pearl-venue',
    slug: 'zanzibar-pearl-venue',
    name: 'The Zanzibar Pearl',
    excerpt:
      'Perched on the Indian Ocean with open-air pavilions, private beach access, and unobstructed sunset views, The Zanzibar Pearl offers an all-inclusive wedding experience. Their in-house team handles everything from décor setup and catering coordination to guest transfers and overnight stays, so couples can be fully present on the day.',
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
    id: 'opus-studio',
    slug: 'opus-studio',
    name: 'OpusStudio',
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
      alt: 'Bride portrait by OpusStudio',
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
    id: 'mlimacity-hall',
    slug: 'mlimacity-hall',
    name: 'Mlimacity Hall',
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
      type: 'image',
      src: '/assets/images/couples_together.jpg',
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

import { enrichVendor } from './vendors-seed'

export const vendors: Vendor[] = baseVendors.map(enrichVendor)

export function getVendorsByCategory(categoryId: VendorCategoryId) {
  return vendors.filter((v) => v.categoryId === categoryId)
}

export function getFeaturedVendors() {
  return vendors.filter((v) => v.featured)
}

export function getVendor(slug: string) {
  return vendors.find((vendor) => vendor.slug === slug)
}
