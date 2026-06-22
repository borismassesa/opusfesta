import { createSupabaseServerClient } from '@/lib/supabase-server'
import { DEFAULT_LOCALE, resolveLocalized, type Locale, type MaybeLocalized } from './localized'

// What the render components receive: every translatable field already resolved
// to a flat string in the active locale.
export type CtaContent = {
  background_image_url: string
  eyebrow: string
  headline_line_1: string
  headline_line_2: string
  headline_line_3: string
  subheadline: string
  cta_label: string
  cta_href: string
  footnote: string
}

// What's stored in the DB: translatable fields may be `{ en, sw }` objects (or
// legacy plain strings). Resolved down to CtaContent at load time.
type StoredCtaContent = Omit<
  CtaContent,
  'eyebrow' | 'headline_line_1' | 'headline_line_2' | 'headline_line_3' | 'subheadline' | 'cta_label' | 'footnote'
> & {
  eyebrow: MaybeLocalized
  headline_line_1: MaybeLocalized
  headline_line_2: MaybeLocalized
  headline_line_3: MaybeLocalized
  subheadline: MaybeLocalized
  cta_label: MaybeLocalized
  footnote: MaybeLocalized
}

export const CTA_FALLBACK: CtaContent = {
  background_image_url: '/assets/images/mauzo_crew.jpg',
  eyebrow: 'Free to start. Always.',
  headline_line_1: 'Grow your',
  headline_line_2: 'business',
  headline_line_3: 'on OpusFesta.',
  subheadline:
    'Join hundreds of wedding pros across East Africa winning more bookings on OpusFesta.',
  cta_label: 'Sign up free',
  cta_href: '/sign-up',
  footnote: 'No credit card · Set up in minutes',
}

export async function loadCtaContent(locale: Locale = DEFAULT_LOCALE): Promise<CtaContent> {
  if (!process.env.NEXT_PUBLIC_SUPABASE_URL || !process.env.SUPABASE_SERVICE_ROLE_KEY) {
    return CTA_FALLBACK
  }
  try {
    const supabase = createSupabaseServerClient()
    const { data } = await supabase
      .from('website_page_sections')
      .select('content')
      .eq('page_key', 'vendors_home')
      .eq('section_key', 'cta')
      .maybeSingle()
    const stored = data?.content as Partial<StoredCtaContent> | undefined
    // Mirror the original `{ ...CTA_FALLBACK, ...stored }` merge: a truly-missing
    // key keeps its fallback, but a present (even empty) stored value wins.
    // Translatable fields are resolved to the active locale (legacy plain
    // strings render as-is); scalar fields pass through untouched.
    if (stored) {
      const resolve = (key: keyof StoredCtaContent, fallback: string) =>
        key in stored ? resolveLocalized(stored[key] as MaybeLocalized, locale) : fallback
      return {
        background_image_url: stored.background_image_url ?? CTA_FALLBACK.background_image_url,
        eyebrow: resolve('eyebrow', CTA_FALLBACK.eyebrow),
        headline_line_1: resolve('headline_line_1', CTA_FALLBACK.headline_line_1),
        headline_line_2: resolve('headline_line_2', CTA_FALLBACK.headline_line_2),
        headline_line_3: resolve('headline_line_3', CTA_FALLBACK.headline_line_3),
        subheadline: resolve('subheadline', CTA_FALLBACK.subheadline),
        cta_label: resolve('cta_label', CTA_FALLBACK.cta_label),
        cta_href: stored.cta_href ?? CTA_FALLBACK.cta_href,
        footnote: resolve('footnote', CTA_FALLBACK.footnote),
      }
    }
    return CTA_FALLBACK
  } catch {
    return CTA_FALLBACK
  }
}
