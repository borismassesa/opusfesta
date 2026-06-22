import { createSupabaseServerClient } from '@/lib/supabase-server'
import { DEFAULT_LOCALE, resolveLocalized, type Locale, type MaybeLocalized } from './localized'

export type FeatureIconKey =
  | 'calendar-check'
  | 'users'
  | 'shield-check'
  | 'sparkles'
  | 'heart-handshake'
  | 'message-square'
  | 'bell'
  | 'clipboard-list'
  | 'wallet'
  | 'gift'
  | 'map-pin'
  | 'star'

// What the render components receive: every translatable field already resolved
// to a flat string in the active locale.
export type ChecklistItem = {
  id: string
  label: string
  weeks: string
  done: boolean
}

export type FeatureCard = {
  id: string
  icon: FeatureIconKey
  title: string
  body: string
}

export type PricingComparisonContent = {
  headline_line_1: string
  headline_line_2: string
  subheadline: string
  cta_label: string
  cta_href: string
  couple_image_url: string
  promo_image_url: string
  promo_heading_line_1: string
  promo_heading_line_2: string
  promo_subheading: string
  checklist_label: string
  checklist: ChecklistItem[]
  features: FeatureCard[]
}

// What's stored in the DB: translatable fields may be `{ en, sw }` objects (or
// legacy plain strings). Resolved down to the flat types above at load time.
type StoredChecklistItem = {
  id: string
  label: MaybeLocalized
  weeks: MaybeLocalized
  done: boolean
}

type StoredFeatureCard = {
  id: string
  icon: FeatureIconKey
  title: MaybeLocalized
  body: MaybeLocalized
}

type StoredPricingComparisonContent = Omit<
  PricingComparisonContent,
  | 'headline_line_1'
  | 'headline_line_2'
  | 'subheadline'
  | 'cta_label'
  | 'promo_heading_line_1'
  | 'promo_heading_line_2'
  | 'promo_subheading'
  | 'checklist_label'
  | 'checklist'
  | 'features'
> & {
  headline_line_1: MaybeLocalized
  headline_line_2: MaybeLocalized
  subheadline: MaybeLocalized
  cta_label: MaybeLocalized
  promo_heading_line_1: MaybeLocalized
  promo_heading_line_2: MaybeLocalized
  promo_subheading: MaybeLocalized
  checklist_label: MaybeLocalized
  checklist: StoredChecklistItem[]
  features: StoredFeatureCard[]
}

export const PRICING_COMPARISON_FALLBACK: PricingComparisonContent = {
  headline_line_1: 'NEVER MISS',
  headline_line_2: 'A LEAD.',
  subheadline:
    'Stop juggling DMs, WhatsApp threads, and notebooks. OpusFesta puts every enquiry, quote and booking in one place — so nothing slips through.',
  cta_label: 'Start free',
  cta_href: '/sign-up',
  couple_image_url: '/assets/images/mauzo_crew.jpg',
  promo_image_url: '/assets/images/beautyinbride.jpg',
  promo_heading_line_1: 'Your business.',
  promo_heading_line_2: 'On autopilot.',
  promo_subheading: 'Less admin. More bookings.',
  checklist_label: 'This week',
  checklist: [
    { id: 'quote', label: 'Send quote · Sarah & James', weeks: 'Done', done: true },
    { id: 'deposit', label: 'Confirm deposit · Omar & Priya', weeks: 'Done', done: true },
    { id: 'contract', label: 'Sign contract · Fatuma & Kevin', weeks: 'Today', done: false },
    { id: 'review', label: 'Reply to review · Emma & David', weeks: 'Tomorrow', done: false },
    { id: 'invoice', label: 'Send final invoice · Daniel & Grace', weeks: '2 days', done: false },
  ],
  features: [
    {
      id: 'leads',
      icon: 'message-square',
      title: 'One inbox, every lead',
      body: 'Enquiries from couples land in a single inbox. Reply, send quotes, and follow up — without losing the thread.',
    },
    {
      id: 'pipeline',
      icon: 'clipboard-list',
      title: 'Booking pipeline',
      body: 'Drag deals from enquiry to deposit to confirmed. See where every couple is in your funnel at a glance.',
    },
    {
      id: 'payments',
      icon: 'wallet',
      title: 'Get paid faster',
      body: 'Accept deposits via mobile money or card. Auto-reminders chase the balance — so you keep more of what you earn.',
    },
  ],
}

export async function loadPricingComparisonContent(
  locale: Locale = DEFAULT_LOCALE
): Promise<PricingComparisonContent> {
  if (!process.env.NEXT_PUBLIC_SUPABASE_URL || !process.env.SUPABASE_SERVICE_ROLE_KEY) {
    return PRICING_COMPARISON_FALLBACK
  }
  try {
    const supabase = createSupabaseServerClient()
    const { data } = await supabase
      .from('website_page_sections')
      .select('content')
      .eq('page_key', 'vendors_home')
      .eq('section_key', 'pricing-comparison')
      .maybeSingle()
    const stored = data?.content as Partial<StoredPricingComparisonContent> | undefined
    if (stored) {
      // Translatable fields are resolved to the active locale (legacy plain
      // strings render as-is). Scalars (hrefs, image urls, icon keys, ids,
      // done flags) pass through unchanged.
      const checklist =
        Array.isArray(stored.checklist) && stored.checklist.length > 0
          ? stored.checklist.map((it) => ({
              id: it.id,
              label: resolveLocalized(it.label, locale),
              weeks: resolveLocalized(it.weeks, locale),
              done: it.done,
            }))
          : PRICING_COMPARISON_FALLBACK.checklist
      const features =
        Array.isArray(stored.features) && stored.features.length > 0
          ? stored.features.map((f) => ({
              id: f.id,
              icon: f.icon,
              title: resolveLocalized(f.title, locale),
              body: resolveLocalized(f.body, locale),
            }))
          : PRICING_COMPARISON_FALLBACK.features
      return {
        headline_line_1:
          resolveLocalized(stored.headline_line_1, locale) ||
          PRICING_COMPARISON_FALLBACK.headline_line_1,
        headline_line_2:
          resolveLocalized(stored.headline_line_2, locale) ||
          PRICING_COMPARISON_FALLBACK.headline_line_2,
        subheadline:
          resolveLocalized(stored.subheadline, locale) || PRICING_COMPARISON_FALLBACK.subheadline,
        cta_label:
          resolveLocalized(stored.cta_label, locale) || PRICING_COMPARISON_FALLBACK.cta_label,
        cta_href: stored.cta_href ?? PRICING_COMPARISON_FALLBACK.cta_href,
        couple_image_url:
          stored.couple_image_url ?? PRICING_COMPARISON_FALLBACK.couple_image_url,
        promo_image_url: stored.promo_image_url ?? PRICING_COMPARISON_FALLBACK.promo_image_url,
        promo_heading_line_1:
          resolveLocalized(stored.promo_heading_line_1, locale) ||
          PRICING_COMPARISON_FALLBACK.promo_heading_line_1,
        promo_heading_line_2:
          resolveLocalized(stored.promo_heading_line_2, locale) ||
          PRICING_COMPARISON_FALLBACK.promo_heading_line_2,
        promo_subheading:
          resolveLocalized(stored.promo_subheading, locale) ||
          PRICING_COMPARISON_FALLBACK.promo_subheading,
        checklist_label:
          resolveLocalized(stored.checklist_label, locale) ||
          PRICING_COMPARISON_FALLBACK.checklist_label,
        checklist,
        features,
      }
    }
    return PRICING_COMPARISON_FALLBACK
  } catch {
    return PRICING_COMPARISON_FALLBACK
  }
}
