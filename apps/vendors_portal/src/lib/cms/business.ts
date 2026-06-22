import { createSupabaseServerClient } from '@/lib/supabase-server'
import { DEFAULT_LOCALE, resolveLocalized, type Locale, type MaybeLocalized } from './localized'

// PUBLIC types: every translatable field already resolved to a flat string in
// the active locale. The render components only ever see these.
export type UpcomingBooking = {
  id: string
  name: string
  date: string
  image_url: string
}

export type VendorShowcase = {
  id: string
  name: string
  category: string
  location: string
  avatar_url: string
  cover_url: string
  stars: number
  reviews: number
  response: string
  bookings: number
  enquiries: number
  views: string
  upcoming: UpcomingBooking[]
}

export type FeaturePill = { id: string; label: string }

export type BusinessContent = {
  eyebrow: string
  headline_line_1: string
  headline_line_2: string
  headline_line_3: string
  subheadline: string
  feature_pills: FeaturePill[]
  primary_cta_label: string
  primary_cta_href: string
  secondary_cta_label: string
  secondary_cta_href: string
  verified_badge: string
  booked_badge: string
  upcoming_label: string
  bookings_suffix: string
  bookings_stat_label: string
  enquiries_stat_label: string
  views_stat_label: string
  reviews_suffix: string
  response_suffix: string
  vendors: VendorShowcase[]
}

// STORED types: what's in the DB. Translatable fields may be `{ en, sw }`
// objects (or legacy plain strings). Resolved down to the public types at load
// time. Scalars (hrefs, image urls, ids, ratings, stat values) stay as-is.
type StoredUpcomingBooking = Omit<UpcomingBooking, 'name' | 'date'> & {
  name: MaybeLocalized
  date: MaybeLocalized
}

type StoredVendorShowcase = Omit<VendorShowcase, 'name' | 'category' | 'location' | 'upcoming'> & {
  name: MaybeLocalized
  category: MaybeLocalized
  location: MaybeLocalized
  upcoming: StoredUpcomingBooking[]
}

type StoredFeaturePill = { id: string; label: MaybeLocalized }

type StoredBusinessContent = Omit<
  BusinessContent,
  | 'eyebrow'
  | 'headline_line_1'
  | 'headline_line_2'
  | 'headline_line_3'
  | 'subheadline'
  | 'feature_pills'
  | 'primary_cta_label'
  | 'secondary_cta_label'
  | 'verified_badge'
  | 'booked_badge'
  | 'upcoming_label'
  | 'bookings_suffix'
  | 'bookings_stat_label'
  | 'enquiries_stat_label'
  | 'views_stat_label'
  | 'reviews_suffix'
  | 'response_suffix'
  | 'vendors'
> & {
  eyebrow: MaybeLocalized
  headline_line_1: MaybeLocalized
  headline_line_2: MaybeLocalized
  headline_line_3: MaybeLocalized
  subheadline: MaybeLocalized
  feature_pills: StoredFeaturePill[]
  primary_cta_label: MaybeLocalized
  secondary_cta_label: MaybeLocalized
  verified_badge: MaybeLocalized
  booked_badge: MaybeLocalized
  upcoming_label: MaybeLocalized
  bookings_suffix: MaybeLocalized
  bookings_stat_label: MaybeLocalized
  enquiries_stat_label: MaybeLocalized
  views_stat_label: MaybeLocalized
  reviews_suffix: MaybeLocalized
  response_suffix: MaybeLocalized
  vendors: StoredVendorShowcase[]
}

export const BUSINESS_FALLBACK: BusinessContent = {
  eyebrow: 'For vendors',
  headline_line_1: 'Your next',
  headline_line_2: 'client is',
  headline_line_3: 'Searching.',
  subheadline:
    'Connect with couples actively planning their wedding. Manage bookings, communicate with clients, and grow your business. All in one place.',
  feature_pills: [
    { id: 'p1', label: 'Get discovered' },
    { id: 'p2', label: 'Manage bookings' },
    { id: 'p3', label: 'Get paid on time' },
    { id: 'p4', label: 'Build your reputation' },
    { id: 'p5', label: 'Showcase your portfolio' },
  ],
  primary_cta_label: 'Join as a vendor',
  primary_cta_href: '/sign-up',
  secondary_cta_label: 'See success stories',
  secondary_cta_href: '#testimonials',
  verified_badge: 'Verified',
  booked_badge: 'Booked',
  upcoming_label: 'Upcoming',
  bookings_suffix: 'bookings',
  bookings_stat_label: 'Bookings',
  enquiries_stat_label: 'Enquiries',
  views_stat_label: 'Profile Views',
  reviews_suffix: 'reviews',
  response_suffix: 'response',
  vendors: [
    {
      id: 'osei',
      name: 'Osei Photography',
      category: 'Photography',
      location: 'Zanzibar',
      avatar_url: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=200&q=80',
      cover_url: 'https://images.unsplash.com/photo-1537633552985-df8429e8048b?auto=format&fit=crop&w=600&q=80',
      stars: 4.9, reviews: 84, response: '98%',
      bookings: 38, enquiries: 124, views: '2.4k',
      upcoming: [
        { id: 'b1', name: 'Sarah & James', date: 'Dec 14, 2025', image_url: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&w=200&q=80' },
        { id: 'b2', name: 'Omar & Priya', date: 'Jan 8, 2026', image_url: 'https://images.unsplash.com/photo-1542103749-8ef59b94f47e?auto=format&fit=crop&w=200&q=80' },
      ],
    },
    {
      id: 'bloom',
      name: 'Bloom & Petal Florists',
      category: 'Florals & Decor',
      location: 'Nairobi',
      avatar_url: 'https://images.unsplash.com/photo-1488426862026-3ee34a7d66df?auto=format&fit=crop&w=200&q=80',
      cover_url: 'https://images.unsplash.com/photo-1465495976277-4387d4b0b4c6?auto=format&fit=crop&w=600&q=80',
      stars: 4.8, reviews: 61, response: '95%',
      bookings: 52, enquiries: 198, views: '3.1k',
      upcoming: [
        { id: 'b3', name: 'Fatuma & Kevin', date: 'Mar 2, 2026', image_url: 'https://images.unsplash.com/photo-1531746020798-e6953c6e8e04?auto=format&fit=crop&w=200&q=80' },
        { id: 'b4', name: 'Emma & David', date: 'Mar 18, 2026', image_url: 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?auto=format&fit=crop&w=200&q=80' },
      ],
    },
    {
      id: 'golden',
      name: 'Golden Hour Venues',
      category: 'Venue',
      location: 'Moshi',
      avatar_url: 'https://images.unsplash.com/photo-1529626455594-4ff0802cfb7e?auto=format&fit=crop&w=200&q=80',
      cover_url: 'https://images.unsplash.com/photo-1519167758481-83f550bb49b3?auto=format&fit=crop&w=600&q=80',
      stars: 4.7, reviews: 112, response: '92%',
      bookings: 24, enquiries: 310, views: '5.8k',
      upcoming: [
        { id: 'b5', name: 'Daniel & Grace', date: 'Feb 21, 2026', image_url: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=200&q=80' },
        { id: 'b6', name: 'Aisha & Tom', date: 'Apr 5, 2026', image_url: 'https://images.unsplash.com/photo-1487412720507-e7ab37603c6f?auto=format&fit=crop&w=200&q=80' },
      ],
    },
    {
      id: 'spice',
      name: 'Spice Route Catering',
      category: 'Catering',
      location: 'Dar es Salaam',
      avatar_url: 'https://images.unsplash.com/photo-1463453091185-61582044d556?auto=format&fit=crop&w=200&q=80',
      cover_url: 'https://images.unsplash.com/photo-1555244162-803834f70033?auto=format&fit=crop&w=600&q=80',
      stars: 4.9, reviews: 73, response: '99%',
      bookings: 67, enquiries: 241, views: '4.2k',
      upcoming: [
        { id: 'b7', name: 'Lucia & Marco', date: 'Jan 25, 2026', image_url: 'https://images.unsplash.com/photo-1529626455594-4ff0802cfb7e?auto=format&fit=crop&w=200&q=80' },
        { id: 'b8', name: 'James & Ngozi', date: 'Feb 14, 2026', image_url: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?auto=format&fit=crop&w=200&q=80' },
      ],
    },
    {
      id: 'strings',
      name: 'Elegant Strings Band',
      category: 'Music & Entertainment',
      location: 'Arusha',
      avatar_url: 'https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?auto=format&fit=crop&w=200&q=80',
      cover_url: 'https://images.unsplash.com/photo-1511671782779-c97d3d27a1d4?auto=format&fit=crop&w=600&q=80',
      stars: 4.8, reviews: 49, response: '96%',
      bookings: 31, enquiries: 87, views: '1.9k',
      upcoming: [
        { id: 'b9', name: 'Grace & Michael', date: 'Dec 28, 2025', image_url: 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?auto=format&fit=crop&w=200&q=80' },
        { id: 'b10', name: 'Kofi & Amina', date: 'Jan 15, 2026', image_url: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=200&q=80' },
      ],
    },
  ],
}

export async function loadBusinessContent(
  locale: Locale = DEFAULT_LOCALE
): Promise<BusinessContent> {
  if (!process.env.NEXT_PUBLIC_SUPABASE_URL || !process.env.SUPABASE_SERVICE_ROLE_KEY) {
    return BUSINESS_FALLBACK
  }
  try {
    const supabase = createSupabaseServerClient()
    const { data } = await supabase
      .from('website_page_sections')
      .select('content')
      .eq('page_key', 'vendors_home')
      .eq('section_key', 'business')
      .maybeSingle()
    const stored = data?.content as Partial<StoredBusinessContent> | undefined
    if (stored) {
      // Scalars fall back to the (flat-string) defaults; translatable fields are
      // resolved to the active locale (legacy plain strings render as-is).
      return {
        eyebrow: resolveLocalized(stored.eyebrow, locale) || BUSINESS_FALLBACK.eyebrow,
        headline_line_1: resolveLocalized(stored.headline_line_1, locale) || BUSINESS_FALLBACK.headline_line_1,
        headline_line_2: resolveLocalized(stored.headline_line_2, locale) || BUSINESS_FALLBACK.headline_line_2,
        headline_line_3: resolveLocalized(stored.headline_line_3, locale) || BUSINESS_FALLBACK.headline_line_3,
        subheadline: resolveLocalized(stored.subheadline, locale) || BUSINESS_FALLBACK.subheadline,
        feature_pills:
          Array.isArray(stored.feature_pills) && stored.feature_pills.length > 0
            ? stored.feature_pills.map((p) => ({
                id: p.id,
                label: resolveLocalized(p.label, locale),
              }))
            : BUSINESS_FALLBACK.feature_pills,
        primary_cta_label: resolveLocalized(stored.primary_cta_label, locale) || BUSINESS_FALLBACK.primary_cta_label,
        primary_cta_href: stored.primary_cta_href ?? BUSINESS_FALLBACK.primary_cta_href,
        secondary_cta_label: resolveLocalized(stored.secondary_cta_label, locale) || BUSINESS_FALLBACK.secondary_cta_label,
        secondary_cta_href: stored.secondary_cta_href ?? BUSINESS_FALLBACK.secondary_cta_href,
        verified_badge: resolveLocalized(stored.verified_badge, locale) || BUSINESS_FALLBACK.verified_badge,
        booked_badge: resolveLocalized(stored.booked_badge, locale) || BUSINESS_FALLBACK.booked_badge,
        upcoming_label: resolveLocalized(stored.upcoming_label, locale) || BUSINESS_FALLBACK.upcoming_label,
        bookings_suffix: resolveLocalized(stored.bookings_suffix, locale) || BUSINESS_FALLBACK.bookings_suffix,
        bookings_stat_label: resolveLocalized(stored.bookings_stat_label, locale) || BUSINESS_FALLBACK.bookings_stat_label,
        enquiries_stat_label: resolveLocalized(stored.enquiries_stat_label, locale) || BUSINESS_FALLBACK.enquiries_stat_label,
        views_stat_label: resolveLocalized(stored.views_stat_label, locale) || BUSINESS_FALLBACK.views_stat_label,
        reviews_suffix: resolveLocalized(stored.reviews_suffix, locale) || BUSINESS_FALLBACK.reviews_suffix,
        response_suffix: resolveLocalized(stored.response_suffix, locale) || BUSINESS_FALLBACK.response_suffix,
        vendors:
          Array.isArray(stored.vendors) && stored.vendors.length > 0
            ? stored.vendors.map((v) => ({
                id: v.id,
                name: resolveLocalized(v.name, locale),
                category: resolveLocalized(v.category, locale),
                location: resolveLocalized(v.location, locale),
                avatar_url: v.avatar_url,
                cover_url: v.cover_url,
                stars: v.stars,
                reviews: v.reviews,
                response: v.response,
                bookings: v.bookings,
                enquiries: v.enquiries,
                views: v.views,
                upcoming: Array.isArray(v.upcoming)
                  ? v.upcoming.map((b) => ({
                      id: b.id,
                      name: resolveLocalized(b.name, locale),
                      date: resolveLocalized(b.date, locale),
                      image_url: b.image_url,
                    }))
                  : [],
              }))
            : BUSINESS_FALLBACK.vendors,
      }
    }
    return BUSINESS_FALLBACK
  } catch {
    return BUSINESS_FALLBACK
  }
}
