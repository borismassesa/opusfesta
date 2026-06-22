import { createSupabaseServerClient } from '@/lib/supabase-server'
import { DEFAULT_LOCALE, resolveLocalized, type Locale, type MaybeLocalized } from './localized'

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

// What's stored in the DB: translatable fields may be `{ en, sw }` objects (or
// legacy plain strings). Resolved down to the flat types above at load time.
type StoredVendorSearchItem = Omit<
  VendorSearchItem,
  'type' | 'city' | 'city_short' | 'detail1_label' | 'detail1_meta' | 'detail2_label' | 'detail2_meta' | 'perk' | 'budget' | 'count' | 'cta'
> & {
  type: MaybeLocalized
  city: MaybeLocalized
  city_short?: MaybeLocalized
  detail1_label: MaybeLocalized
  detail1_meta: MaybeLocalized
  detail2_label: MaybeLocalized
  detail2_meta: MaybeLocalized
  perk: MaybeLocalized
  budget: MaybeLocalized
  count: MaybeLocalized
  cta: MaybeLocalized
}

type StoredVendorSearchContent = Omit<
  VendorSearchContent,
  'headline_line_1' | 'headline_line_2' | 'subheadline' | 'looking_label' | 'count_suffix' | 'budget_label' | 'perk_badge' | 'verified_label' | 'verified_badge' | 'items'
> & {
  headline_line_1: MaybeLocalized
  headline_line_2: MaybeLocalized
  subheadline: MaybeLocalized
  looking_label: MaybeLocalized
  count_suffix: MaybeLocalized
  budget_label: MaybeLocalized
  perk_badge: MaybeLocalized
  verified_label: MaybeLocalized
  verified_badge: MaybeLocalized
  items: StoredVendorSearchItem[]
}

export const VENDOR_SEARCH_FALLBACK: VendorSearchContent = {
  headline_line_1: 'Get found by',
  headline_line_2: 'the right couples',
  subheadline:
    'Couples search Vendors by category, city, date and budget. When their criteria match your storefront, you appear in their results no ads, no cold pitching.',
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

export async function loadVendorSearchContent(
  locale: Locale = DEFAULT_LOCALE
): Promise<VendorSearchContent> {
  if (!process.env.NEXT_PUBLIC_SUPABASE_URL || !process.env.SUPABASE_SERVICE_ROLE_KEY) {
    return VENDOR_SEARCH_FALLBACK
  }
  try {
    const supabase = createSupabaseServerClient()
    const { data } = await supabase
      .from('website_page_sections')
      .select('content')
      .eq('page_key', 'vendors_home')
      .eq('section_key', 'vendor-search')
      .maybeSingle()
    const stored = data?.content as Partial<StoredVendorSearchContent> | undefined
    // Translatable fields are resolved to the active locale (legacy plain
    // strings render as-is); hrefs/ids/icon keys stay scalar.
    if (stored && Array.isArray(stored.items) && stored.items.length > 0) {
      return {
        headline_line_1: resolveLocalized(stored.headline_line_1, locale),
        headline_line_2: resolveLocalized(stored.headline_line_2, locale),
        subheadline: resolveLocalized(stored.subheadline, locale),
        looking_label: resolveLocalized(stored.looking_label, locale),
        count_suffix: resolveLocalized(stored.count_suffix, locale),
        budget_label: resolveLocalized(stored.budget_label, locale),
        budget_currency: stored.budget_currency ?? VENDOR_SEARCH_FALLBACK.budget_currency,
        perk_badge: resolveLocalized(stored.perk_badge, locale),
        verified_label: resolveLocalized(stored.verified_label, locale),
        verified_badge: resolveLocalized(stored.verified_badge, locale),
        items: stored.items.map((it) => ({
          id: it.id,
          type: resolveLocalized(it.type, locale),
          city: resolveLocalized(it.city, locale),
          city_short: it.city_short != null ? resolveLocalized(it.city_short, locale) : undefined,
          detail1_icon: it.detail1_icon,
          detail1_label: resolveLocalized(it.detail1_label, locale),
          detail1_meta: resolveLocalized(it.detail1_meta, locale),
          detail2_icon: it.detail2_icon,
          detail2_label: resolveLocalized(it.detail2_label, locale),
          detail2_meta: resolveLocalized(it.detail2_meta, locale),
          perk: resolveLocalized(it.perk, locale),
          budget: resolveLocalized(it.budget, locale),
          count: resolveLocalized(it.count, locale),
          cta: resolveLocalized(it.cta, locale),
        })),
      }
    }
    return VENDOR_SEARCH_FALLBACK
  } catch {
    return VENDOR_SEARCH_FALLBACK
  }
}
