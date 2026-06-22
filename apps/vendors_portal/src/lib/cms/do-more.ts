import { createSupabaseServerClient } from '@/lib/supabase-server'
import { DEFAULT_LOCALE, resolveLocalized, type Locale, type MaybeLocalized } from './localized'

export type StorefrontTheme = 'light' | 'dark' | 'forest'
export type LeadStatus = 'Hot' | 'Warm' | 'Cold'

// What the render components receive: every translatable field already resolved
// to a flat string in the active locale.
export type StorefrontDemo = {
  id: string
  url: string
  business_name: string
  category: string
  location: string
  cover_url: string
  avatar_url: string
  rating: number
  reviews: number
  response: string
  bookings: number
  theme: StorefrontTheme
}

export type LeadDemo = {
  id: string
  name: string
  event_label: string
  image_url: string
  status: LeadStatus
}

export type DoMoreContent = {
  headline_line_1: string
  headline_line_2: string
  headline_line_3: string
  side_description: string
  cta_label: string
  cta_href: string
  storefront_title: string
  storefront_description: string
  storefront_cta: string
  storefront_cta_href: string
  storefronts: StorefrontDemo[]
  leads_title: string
  leads_description: string
  leads_cta: string
  leads_cta_href: string
  leads_total: number
  leads_hot: number
  leads_warm: number
  leads_cold: number
  leads_label_all: string
  leads_label_hot: string
  leads_label_warm: string
  leads_label_cold: string
  leads: LeadDemo[]
}

// What's stored in the DB: translatable fields may be `{ en, sw }` objects (or
// legacy plain strings). Resolved down to the flat types above at load time.
type StoredStorefrontDemo = Omit<StorefrontDemo, 'business_name' | 'category' | 'location'> & {
  business_name: MaybeLocalized
  category: MaybeLocalized
  location: MaybeLocalized
}

type StoredLeadDemo = Omit<LeadDemo, 'name' | 'event_label'> & {
  name: MaybeLocalized
  event_label: MaybeLocalized
}

type StoredDoMoreContent = Omit<
  DoMoreContent,
  | 'headline_line_1'
  | 'headline_line_2'
  | 'headline_line_3'
  | 'side_description'
  | 'cta_label'
  | 'storefront_title'
  | 'storefront_description'
  | 'storefront_cta'
  | 'storefronts'
  | 'leads_title'
  | 'leads_description'
  | 'leads_cta'
  | 'leads_label_all'
  | 'leads_label_hot'
  | 'leads_label_warm'
  | 'leads_label_cold'
  | 'leads'
> & {
  headline_line_1: MaybeLocalized
  headline_line_2: MaybeLocalized
  headline_line_3: MaybeLocalized
  side_description: MaybeLocalized
  cta_label: MaybeLocalized
  storefront_title: MaybeLocalized
  storefront_description: MaybeLocalized
  storefront_cta: MaybeLocalized
  storefronts: StoredStorefrontDemo[]
  leads_title: MaybeLocalized
  leads_description: MaybeLocalized
  leads_cta: MaybeLocalized
  leads_label_all: MaybeLocalized
  leads_label_hot: MaybeLocalized
  leads_label_warm: MaybeLocalized
  leads_label_cold: MaybeLocalized
  leads: StoredLeadDemo[]
}

export const DO_MORE_FALLBACK: DoMoreContent = {
  headline_line_1: 'More than',
  headline_line_2: 'just a',
  headline_line_3: 'storefront',
  side_description:
    'Less admin, less stress. Manage your storefront, leads and bookings — every detail in check. All in one place.',
  cta_label: 'Get started free',
  cta_href: '/sign-up',
  storefront_title: 'A storefront that converts',
  storefront_description:
    'Beautiful, mobile-ready profiles that let couples book a discovery call in seconds — no design skills needed.',
  storefront_cta: 'Build your storefront',
  storefront_cta_href: '/sign-up',
  storefronts: [
    {
      id: 'osei',
      url: 'osei-photography.opusfesta.com',
      business_name: 'Osei Photography',
      category: 'Photography',
      location: 'Zanzibar',
      cover_url: 'https://images.unsplash.com/photo-1537633552985-df8429e8048b?auto=format&fit=crop&w=600&q=80',
      avatar_url: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=200&q=80',
      rating: 4.9,
      reviews: 84,
      response: '98%',
      bookings: 38,
      theme: 'light',
    },
    {
      id: 'bloom',
      url: 'bloom-petal.opusfesta.com',
      business_name: 'Bloom & Petal Florists',
      category: 'Florals & Decor',
      location: 'Nairobi',
      cover_url: 'https://images.unsplash.com/photo-1465495976277-4387d4b0b4c6?auto=format&fit=crop&w=600&q=80',
      avatar_url: 'https://images.unsplash.com/photo-1488426862026-3ee34a7d66df?auto=format&fit=crop&w=200&q=80',
      rating: 4.8,
      reviews: 61,
      response: '95%',
      bookings: 52,
      theme: 'forest',
    },
    {
      id: 'golden',
      url: 'golden-hour-venues.opusfesta.com',
      business_name: 'Golden Hour Venues',
      category: 'Venue',
      location: 'Moshi',
      cover_url: 'https://images.unsplash.com/photo-1519167758481-83f550bb49b3?auto=format&fit=crop&w=600&q=80',
      avatar_url: 'https://images.unsplash.com/photo-1529626455594-4ff0802cfb7e?auto=format&fit=crop&w=200&q=80',
      rating: 4.7,
      reviews: 112,
      response: '92%',
      bookings: 24,
      theme: 'dark',
    },
  ],
  leads_title: 'Stay on top of every lead',
  leads_description:
    'All enquiries land in one inbox. Reply, send quotes, and track deals from first message to confirmed booking.',
  leads_cta: 'Open the inbox',
  leads_cta_href: '/sign-up',
  leads_total: 38,
  leads_hot: 9,
  leads_warm: 17,
  leads_cold: 12,
  leads_label_all: 'All leads',
  leads_label_hot: 'Hot',
  leads_label_warm: 'Warm',
  leads_label_cold: 'Cold',
  leads: [
    { id: 'l1', name: 'Sarah & James', event_label: 'Dec 14 · Photography', image_url: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&w=200&q=80', status: 'Hot' },
    { id: 'l2', name: 'Omar & Priya',  event_label: 'Jan 8 · 120 guests',   image_url: 'https://images.unsplash.com/photo-1542103749-8ef59b94f47e?auto=format&fit=crop&w=200&q=80', status: 'Hot' },
    { id: 'l3', name: 'Fatuma & Kevin',event_label: 'Mar 2 · Florals',      image_url: 'https://images.unsplash.com/photo-1531746020798-e6953c6e8e04?auto=format&fit=crop&w=200&q=80', status: 'Warm' },
    { id: 'l4', name: 'Daniel & Grace',event_label: 'Feb 21 · Venue tour',  image_url: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=200&q=80', status: 'Cold' },
    { id: 'l5', name: 'Aisha & Tom',   event_label: 'Apr 5 · Catering',     image_url: 'https://images.unsplash.com/photo-1488426862026-3ee34a7d66df?auto=format&fit=crop&w=200&q=80', status: 'Warm' },
  ],
}

export async function loadDoMoreContent(locale: Locale = DEFAULT_LOCALE): Promise<DoMoreContent> {
  if (!process.env.NEXT_PUBLIC_SUPABASE_URL || !process.env.SUPABASE_SERVICE_ROLE_KEY) {
    return DO_MORE_FALLBACK
  }
  try {
    const supabase = createSupabaseServerClient()
    const { data } = await supabase
      .from('website_page_sections')
      .select('content')
      .eq('page_key', 'vendors_home')
      .eq('section_key', 'do-more')
      .maybeSingle()
    const stored = data?.content as Partial<StoredDoMoreContent> | undefined
    if (stored) {
      // Translatable fields are resolved to the active locale (legacy plain
      // strings render as-is); scalars (hrefs, numbers, ids, enums, urls) pass
      // through untouched. TRULY-missing fields fall back to DO_MORE_FALLBACK.
      const storedStorefronts =
        Array.isArray(stored.storefronts) && stored.storefronts.length > 0
          ? stored.storefronts
          : null
      const storedLeads =
        Array.isArray(stored.leads) && stored.leads.length > 0 ? stored.leads : null
      return {
        headline_line_1: resolveLocalized(stored.headline_line_1, locale) || DO_MORE_FALLBACK.headline_line_1,
        headline_line_2: resolveLocalized(stored.headline_line_2, locale) || DO_MORE_FALLBACK.headline_line_2,
        headline_line_3: resolveLocalized(stored.headline_line_3, locale) || DO_MORE_FALLBACK.headline_line_3,
        side_description: resolveLocalized(stored.side_description, locale) || DO_MORE_FALLBACK.side_description,
        cta_label: resolveLocalized(stored.cta_label, locale) || DO_MORE_FALLBACK.cta_label,
        cta_href: stored.cta_href ?? DO_MORE_FALLBACK.cta_href,
        storefront_title: resolveLocalized(stored.storefront_title, locale) || DO_MORE_FALLBACK.storefront_title,
        storefront_description: resolveLocalized(stored.storefront_description, locale) || DO_MORE_FALLBACK.storefront_description,
        storefront_cta: resolveLocalized(stored.storefront_cta, locale) || DO_MORE_FALLBACK.storefront_cta,
        storefront_cta_href: stored.storefront_cta_href ?? DO_MORE_FALLBACK.storefront_cta_href,
        storefronts: storedStorefronts
          ? storedStorefronts.map((s) => ({
              id: s.id,
              url: s.url,
              business_name: resolveLocalized(s.business_name, locale),
              category: resolveLocalized(s.category, locale),
              location: resolveLocalized(s.location, locale),
              cover_url: s.cover_url,
              avatar_url: s.avatar_url,
              rating: s.rating,
              reviews: s.reviews,
              response: s.response,
              bookings: s.bookings,
              theme: s.theme,
            }))
          : DO_MORE_FALLBACK.storefronts,
        leads_title: resolveLocalized(stored.leads_title, locale) || DO_MORE_FALLBACK.leads_title,
        leads_description: resolveLocalized(stored.leads_description, locale) || DO_MORE_FALLBACK.leads_description,
        leads_cta: resolveLocalized(stored.leads_cta, locale) || DO_MORE_FALLBACK.leads_cta,
        leads_cta_href: stored.leads_cta_href ?? DO_MORE_FALLBACK.leads_cta_href,
        leads_total: stored.leads_total ?? DO_MORE_FALLBACK.leads_total,
        leads_hot: stored.leads_hot ?? DO_MORE_FALLBACK.leads_hot,
        leads_warm: stored.leads_warm ?? DO_MORE_FALLBACK.leads_warm,
        leads_cold: stored.leads_cold ?? DO_MORE_FALLBACK.leads_cold,
        leads_label_all: resolveLocalized(stored.leads_label_all, locale) || DO_MORE_FALLBACK.leads_label_all,
        leads_label_hot: resolveLocalized(stored.leads_label_hot, locale) || DO_MORE_FALLBACK.leads_label_hot,
        leads_label_warm: resolveLocalized(stored.leads_label_warm, locale) || DO_MORE_FALLBACK.leads_label_warm,
        leads_label_cold: resolveLocalized(stored.leads_label_cold, locale) || DO_MORE_FALLBACK.leads_label_cold,
        leads: storedLeads
          ? storedLeads.map((l) => ({
              id: l.id,
              name: resolveLocalized(l.name, locale),
              event_label: resolveLocalized(l.event_label, locale),
              image_url: l.image_url,
              status: l.status,
            }))
          : DO_MORE_FALLBACK.leads,
      }
    }
    return DO_MORE_FALLBACK
  } catch {
    return DO_MORE_FALLBACK
  }
}

export type ThemeColors = {
  navBg: string
  navBorder: string
  navText: string
  ctaBg: string
  ctaText: string
}

export const THEME_COLORS: Record<StorefrontTheme, ThemeColors> = {
  light: {
    navBg: '#FFFFFF', navBorder: '#EDE8E2', navText: '#1A1A1A',
    ctaBg: '#1A1A1A', ctaText: '#FFFFFF',
  },
  forest: {
    navBg: '#EEF2ED', navBorder: '#C8D9C4', navText: '#2A3828',
    ctaBg: '#2A3828', ctaText: '#FFFFFF',
  },
  dark: {
    navBg: '#1A1A1A', navBorder: '#333333', navText: '#FFFFFF',
    ctaBg: '#FFFFFF', ctaText: '#1A1A1A',
  },
}
