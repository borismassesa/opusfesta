import { createSupabaseServerClient } from '@/lib/supabase-server'
import { DEFAULT_LOCALE, resolveLocalized, type Locale, type MaybeLocalized } from './localized'

// What the render components receive: every translatable field already resolved
// to a flat string in the active locale.
export type HeroContent = {
  headline_line_1: string
  headline_line_2: string
  headline_line_3: string
  subheadline: string
  primary_cta_label: string
  primary_cta_href: string
  secondary_cta_label: string
  secondary_cta_href: string
  media_type: 'video' | 'image'
  media_url: string
}

// What's stored in the DB: translatable fields may be `{ en, sw }` objects (or
// legacy plain strings). Resolved down to HeroContent at load time.
type StoredHeroContent = Omit<
  HeroContent,
  'headline_line_1' | 'headline_line_2' | 'headline_line_3' | 'subheadline' | 'primary_cta_label' | 'secondary_cta_label'
> & {
  headline_line_1: MaybeLocalized
  headline_line_2: MaybeLocalized
  headline_line_3: MaybeLocalized
  subheadline: MaybeLocalized
  primary_cta_label: MaybeLocalized
  secondary_cta_label: MaybeLocalized
}

export const HERO_FALLBACK: HeroContent = {
  headline_line_1: 'Grow Your',
  headline_line_2: 'Wedding Business',
  headline_line_3: 'On OpusFesta.',
  subheadline:
    'Reach thousands of couples planning their wedding in Tanzania. Manage leads, bookings, and your storefront from one place — and keep more of what you earn.',
  primary_cta_label: 'Start free',
  primary_cta_href: '/sign-up',
  secondary_cta_label: 'See how it works',
  secondary_cta_href: '#features',
  media_type: 'video',
  media_url: '/assets/videos/couple_.mp4',
}

export async function loadHeroContent(locale: Locale = DEFAULT_LOCALE): Promise<HeroContent> {
  if (!process.env.NEXT_PUBLIC_SUPABASE_URL || !process.env.SUPABASE_SERVICE_ROLE_KEY) {
    return HERO_FALLBACK
  }
  try {
    const supabase = createSupabaseServerClient()
    const { data } = await supabase
      .from('website_page_sections')
      .select('content')
      .eq('page_key', 'vendors_home')
      .eq('section_key', 'hero')
      .maybeSingle()
    const stored = data?.content as Partial<StoredHeroContent> | undefined
    // If the row exists, fill TRULY-missing fields with empty strings (not
    // fallback values) — otherwise an older row missing headline_line_3 would
    // pick up the fallback's line 3 and duplicate content. Translatable fields
    // are resolved to the active locale (legacy plain strings render as-is).
    if (stored) {
      return {
        headline_line_1: resolveLocalized(stored.headline_line_1, locale),
        headline_line_2: resolveLocalized(stored.headline_line_2, locale),
        headline_line_3: resolveLocalized(stored.headline_line_3, locale),
        subheadline: resolveLocalized(stored.subheadline, locale),
        primary_cta_label: resolveLocalized(stored.primary_cta_label, locale),
        primary_cta_href: stored.primary_cta_href ?? '',
        secondary_cta_label: resolveLocalized(stored.secondary_cta_label, locale),
        secondary_cta_href: stored.secondary_cta_href ?? '',
        media_type: stored.media_type ?? 'video',
        media_url: stored.media_url ?? '',
      }
    }
    return HERO_FALLBACK
  } catch {
    return HERO_FALLBACK
  }
}
