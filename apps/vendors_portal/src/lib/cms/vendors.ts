import { createSupabaseServerClient } from '@/lib/supabase-server'
import type { Vendor } from '@/lib/vendors'
import { vendors as seedVendors, vendorCategories } from '@/lib/vendors'

// Raw shape of a vendor record in Supabase (snake_case).
// Shape kept close to DB columns; mapped to the Vendor type used by page components.
type VendorRow = {
  id: string
  slug: string
  name: string
  excerpt: string
  category: string
  category_id: string
  city: string
  price_range: string
  rating: number
  review_count: number
  badge: 'Top Rated' | 'New' | 'Verified' | null
  featured: boolean
  published: boolean
  hero_media: {
    type: 'image' | 'video'
    src: string
    alt: string
    poster?: string
  }
  gallery: string[]
  about: string | null
  starting_price: string | null
  response_time: string | null
  locally_owned: boolean | null
  years_in_business: number | null
  languages: string[]
  awards: string[]
  capacity: { min: number; max: number } | null
  services: string[]
  pricing_details: Vendor['pricingDetails']
  detailed_reviews: Vendor['detailedReviews']
  faqs: Vendor['faqs']
  location: Vendor['location'] | null
  service_area: string[]
  team: Vendor['team']
  social_links: Vendor['socialLinks'] | null
  availability: Vendor['availability'] | null
}

function rowToVendor(row: VendorRow): Vendor {
  return {
    id: row.id,
    slug: row.slug,
    name: row.name,
    excerpt: row.excerpt,
    category: row.category,
    categoryId: row.category_id as Vendor['categoryId'],
    city: row.city,
    priceRange: row.price_range,
    rating: Number(row.rating ?? 0),
    reviewCount: row.review_count,
    badge: row.badge ?? undefined,
    featured: row.featured || undefined,
    heroMedia: row.hero_media,
    gallery: row.gallery?.length ? row.gallery : undefined,
    about: row.about ?? undefined,
    startingPrice: row.starting_price ?? undefined,
    responseTime: row.response_time ?? undefined,
    locallyOwned: row.locally_owned ?? undefined,
    yearsInBusiness: row.years_in_business ?? undefined,
    languages: row.languages?.length ? row.languages : undefined,
    awards: row.awards?.length ? row.awards : undefined,
    capacity: row.capacity ?? undefined,
    services: row.services?.length ? row.services : undefined,
    pricingDetails: row.pricing_details?.length ? row.pricing_details : undefined,
    detailedReviews: row.detailed_reviews?.length ? row.detailed_reviews : undefined,
    faqs: row.faqs?.length ? row.faqs : undefined,
    location: row.location ?? undefined,
    serviceArea: row.service_area?.length ? row.service_area : undefined,
    team: row.team?.length ? row.team : undefined,
    socialLinks: row.social_links ?? undefined,
    availability: row.availability ?? undefined,
  }
}

/**
 * Load all published vendors from Supabase, falling back to the static seed if
 * Supabase is unavailable or returns nothing. Returned list is pre-enriched at
 * the CMS layer — no need for the `enrichVendor` procedural generator.
 */
export async function loadVendorsFromSupabase(): Promise<Vendor[]> {
  if (!process.env.NEXT_PUBLIC_SUPABASE_URL || !process.env.SUPABASE_SERVICE_ROLE_KEY) {
    return seedVendors
  }
  try {
    const supabase = createSupabaseServerClient()
    const { data, error } = await supabase
      .from('website_vendors')
      .select('*')
      .eq('published', true)
      .order('featured', { ascending: false })
      .order('rating', { ascending: false, nullsFirst: false })
      .order('name', { ascending: true })
    if (error || !data || data.length === 0) return seedVendors
    return (data as VendorRow[]).map(rowToVendor)
  } catch {
    return seedVendors
  }
}

export async function loadVendorCategoriesFromSupabase() {
  if (!process.env.NEXT_PUBLIC_SUPABASE_URL || !process.env.SUPABASE_SERVICE_ROLE_KEY) {
    return vendorCategories
  }
  try {
    const supabase = createSupabaseServerClient()
    const { data, error } = await supabase
      .from('website_vendor_categories')
      .select('*')
      .order('display_order', { ascending: true })
    if (error || !data || data.length === 0) return vendorCategories
    return data.map((c: { id: string; label: string; count: number }) => ({
      id: c.id as (typeof vendorCategories)[number]['id'],
      label: c.label,
      count: c.count,
    }))
  } catch {
    return vendorCategories
  }
}
