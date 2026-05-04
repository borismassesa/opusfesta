import { createSupabaseServerClient } from '@/lib/supabase'
import { getActiveMarketplaceVendors } from '@/lib/vendors-db'
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
 * Load all browsable vendors for the public listing/search.
 *
 * Two sources are merged because the platform has historically maintained
 * a curated CMS table (`website_vendors`) populated with hand-tuned demo
 * content, and now also has a self-serve onboarding flow that writes to the
 * marketplace `vendors` table. A vendor approved through admin review lives
 * only in `vendors` — without this merge, browsing by name/category would
 * miss them entirely.
 *
 * Precedence: `website_vendors` content wins where a slug exists in both,
 * because the CMS row carries hand-tuned hero media, gallery, ratings, etc.
 * Newly approved marketplace vendors (no CMS row yet) are appended at the
 * end with whatever data the storefront editor has populated.
 */
export async function loadVendorsFromSupabase(): Promise<Vendor[]> {
  if (!process.env.NEXT_PUBLIC_SUPABASE_URL || !process.env.SUPABASE_SERVICE_ROLE_KEY) {
    return seedVendors
  }
  try {
    const supabase = createSupabaseServerClient()
    const [websiteRes, marketplaceVendors] = await Promise.all([
      supabase
        .from('website_vendors')
        .select('*')
        .eq('published', true)
        .order('featured', { ascending: false })
        .order('rating', { ascending: false, nullsFirst: false })
        .order('name', { ascending: true }),
      getActiveMarketplaceVendors(),
    ])

    const websiteVendors =
      websiteRes.error || !websiteRes.data
        ? []
        : (websiteRes.data as VendorRow[]).map(rowToVendor)

    if (websiteVendors.length === 0 && marketplaceVendors.length === 0) {
      return seedVendors
    }

    const slugsCovered = new Set(websiteVendors.map((v) => v.slug))
    const marketplaceOnly = marketplaceVendors.filter(
      (v) => !slugsCovered.has(v.slug),
    )

    return [...websiteVendors, ...marketplaceOnly]
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
