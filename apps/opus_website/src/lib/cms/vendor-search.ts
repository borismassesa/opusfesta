import { createSupabaseServerClient } from '@/lib/supabase'

export type VendorIconKey =
  | 'users'
  | 'calendar'
  | 'camera'
  | 'music'
  | 'utensils'
  | 'flower'
  | 'video'
  | 'sparkles'
  | 'map-pin'
  | 'clock'
  | 'mic'
  | 'gem'

export type VendorSearchItem = {
  id: string
  type: string
  city: string
  city_short?: string
  detail1_icon: VendorIconKey
  detail1_label: string
  detail1_meta: string
  detail2_icon: VendorIconKey
  detail2_label: string
  detail2_meta: string
  perk: string
  budget: string
  count: string
  cta: string
}

export type VendorSearchContent = {
  headline_line_1: string
  headline_line_2: string
  subheadline: string
  looking_label: string
  count_suffix: string
  budget_label: string
  budget_currency: string
  perk_badge: string
  verified_label: string
  verified_badge: string
  items: VendorSearchItem[]
}

export const VENDOR_SEARCH_FALLBACK: VendorSearchContent = {
  headline_line_1: 'Find Your Dream Team',
  headline_line_2: 'Effortlessly',
  subheadline:
    'Save hundreds of hours on wedding research. With transparent pricing and verified reviews.',
  looking_label: 'I am looking for a',
  count_suffix: 'match your criteria',
  budget_label: 'Estimated Budget',
  budget_currency: 'TZS',
  perk_badge: 'Included',
  verified_label: 'Verified & background checked',
  verified_badge: 'Verified',
  items: [
    {
      id: 'venue',
      type: 'Venue',
      city: 'Dar es Salaam',
      city_short: 'Dar',
      detail1_icon: 'users',
      detail1_label: '150 Guests',
      detail1_meta: 'Capacity',
      detail2_icon: 'calendar',
      detail2_label: 'December 2026',
      detail2_meta: 'Availability',
      perk: 'Free site visit included',
      budget: 'TZS 35,000,000',
      count: '142 venues',
      cta: 'Find Venues',
    },
    {
      id: 'photographer',
      type: 'Photographer',
      city: 'Zanzibar',
      detail1_icon: 'camera',
      detail1_label: '8 hrs coverage',
      detail1_meta: 'Package',
      detail2_icon: 'calendar',
      detail2_label: 'June 2026',
      detail2_meta: 'Availability',
      perk: 'Edited gallery in 4 weeks',
      budget: 'TZS 8,500,000',
      count: '89 photographers',
      cta: 'Find Photographers',
    },
    {
      id: 'dj',
      type: 'DJ',
      city: 'Arusha',
      detail1_icon: 'music',
      detail1_label: '5 hrs set',
      detail1_meta: 'Duration',
      detail2_icon: 'calendar',
      detail2_label: 'July 2026',
      detail2_meta: 'Availability',
      perk: 'Sound equipment included',
      budget: 'TZS 3,000,000',
      count: '57 DJs',
      cta: 'Find DJs',
    },
    {
      id: 'caterer',
      type: 'Caterer',
      city: 'Mwanza',
      detail1_icon: 'utensils',
      detail1_label: '120 Guests',
      detail1_meta: 'Capacity',
      detail2_icon: 'calendar',
      detail2_label: 'April 2026',
      detail2_meta: 'Availability',
      perk: 'Free tasting session',
      budget: 'TZS 18,000,000',
      count: '34 caterers',
      cta: 'Find Caterers',
    },
    {
      id: 'florist',
      type: 'Florist',
      city: 'Dodoma',
      detail1_icon: 'flower',
      detail1_label: 'Full décor',
      detail1_meta: 'Package',
      detail2_icon: 'calendar',
      detail2_label: 'August 2026',
      detail2_meta: 'Availability',
      perk: 'Free consultation included',
      budget: 'TZS 10,500,000',
      count: '61 florists',
      cta: 'Find Florists',
    },
    {
      id: 'videographer',
      type: 'Videographer',
      city: 'Moshi',
      detail1_icon: 'video',
      detail1_label: 'Full day shoot',
      detail1_meta: 'Package',
      detail2_icon: 'calendar',
      detail2_label: 'January 2026',
      detail2_meta: 'Availability',
      perk: 'Drone footage included',
      budget: 'TZS 6,500,000',
      count: '43 videographers',
      cta: 'Find Videographers',
    },
  ],
}

export async function loadVendorSearchContent(): Promise<VendorSearchContent> {
  if (!process.env.NEXT_PUBLIC_SUPABASE_URL || !process.env.SUPABASE_SERVICE_ROLE_KEY) {
    return VENDOR_SEARCH_FALLBACK
  }
  try {
    const supabase = createSupabaseServerClient()
    const { data } = await supabase
      .from('website_page_sections')
      .select('content')
      .eq('page_key', 'home')
      .eq('section_key', 'vendor-search')
      .maybeSingle()
    const stored = data?.content as Partial<VendorSearchContent> | undefined
    if (stored && Array.isArray(stored.items) && stored.items.length > 0) {
      return {
        ...VENDOR_SEARCH_FALLBACK,
        ...stored,
        items: stored.items as VendorSearchItem[],
      }
    }
    return VENDOR_SEARCH_FALLBACK
  } catch {
    return VENDOR_SEARCH_FALLBACK
  }
}
