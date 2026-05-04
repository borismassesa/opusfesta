import { createSupabaseServerClient } from '@/lib/supabase-server'

export type StorefrontTheme = 'light' | 'dark' | 'forest'
export type LeadStatus = 'Hot' | 'Warm' | 'Cold'

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

export async function loadDoMoreContent(): Promise<DoMoreContent> {
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
    const stored = data?.content as Partial<DoMoreContent> | undefined
    if (stored) {
      return {
        ...DO_MORE_FALLBACK,
        ...stored,
        storefronts:
          Array.isArray(stored.storefronts) && stored.storefronts.length > 0
            ? (stored.storefronts as StorefrontDemo[])
            : DO_MORE_FALLBACK.storefronts,
        leads:
          Array.isArray(stored.leads) && stored.leads.length > 0
            ? (stored.leads as LeadDemo[])
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
