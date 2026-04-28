// Client-safe types + helpers for the Vendors CMS.
// Loaders live in the page.tsx files to keep this module free of server imports.

export type VendorBadge = 'Top Rated' | 'New' | 'Verified'

export type VendorHeroMedia = {
  type: 'image' | 'video'
  src: string
  alt: string
  poster?: string
}

export type VendorPricingPackage = {
  label: string
  value: string
  services?: string[]
  note?: string
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

export type VendorAvailability = {
  bookedDates: string[]
  limitedDates: string[]
  leadTimeWeeks: number
}

export type VendorFaq = { question: string; answer: string }
export type VendorTeamMember = { name?: string; role?: string; avatar?: string; bio?: string }
export type VendorLocation = { address: string; lat: number; lng: number }
export type VendorSocialLinks = { instagram?: string; facebook?: string; website?: string }
export type VendorCapacity = { min: number; max: number }

export type VendorRecord = {
  id: string
  slug: string
  name: string
  excerpt: string
  category: string
  category_id: string | null
  city: string
  price_range: string
  rating: number
  review_count: number
  badge: VendorBadge | null
  featured: boolean
  published: boolean

  hero_media: VendorHeroMedia
  gallery: string[]

  about: string | null
  starting_price: string | null
  response_time: string | null
  locally_owned: boolean | null
  years_in_business: number | null
  languages: string[]
  awards: string[]
  capacity: VendorCapacity | null
  services: string[]
  pricing_details: VendorPricingPackage[]
  detailed_reviews: VendorReview[]
  faqs: VendorFaq[]
  location: VendorLocation | null
  service_area: string[]
  team: VendorTeamMember[]
  social_links: VendorSocialLinks | null
  availability: VendorAvailability | null

  created_at: string
  updated_at: string
}

export type VendorCategory = {
  id: string
  label: string
  display_order: number
  count: number
}

export const VENDOR_BADGES: VendorBadge[] = ['Top Rated', 'New', 'Verified']

export function emptyVendor(partial: Partial<VendorRecord> = {}): VendorRecord {
  return {
    id: '',
    slug: '',
    name: '',
    excerpt: '',
    category: '',
    category_id: null,
    city: '',
    price_range: '',
    rating: 4.5,
    review_count: 0,
    badge: null,
    featured: false,
    published: true,
    hero_media: { type: 'image', src: '', alt: '' },
    gallery: [],
    about: null,
    starting_price: null,
    response_time: null,
    locally_owned: null,
    years_in_business: null,
    languages: [],
    awards: [],
    capacity: null,
    services: [],
    pricing_details: [],
    detailed_reviews: [],
    faqs: [],
    location: null,
    service_area: [],
    team: [],
    social_links: null,
    availability: null,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
    ...partial,
  }
}
