import { draftMode } from 'next/headers'
import { createSupabaseServerClient } from '@/lib/supabase'
import { DEFAULT_LOCALE, resolveLocalized, type Locale, type MaybeLocalized } from './localized'

export type WebsitesFeatureIcon = 'sparkles' | 'users' | 'link'
export type WebsitesFeatureVisual = 'laptop' | 'rsvp' | 'registry'

export type WebsitesFeatureItem = {
  id: string
  icon: WebsitesFeatureIcon
  title: string
  body: string
  cta_label: string
  cta_href: string
  visual: WebsitesFeatureVisual
  /** Optional uploaded image — replaces the CSS visual mock when set. */
  image_url: string
}

export type WebsitesFeaturesContent = {
  heading: string
  description: string
  /** Background colour applied to every card (hex). */
  background_color: string
  items: WebsitesFeatureItem[]
}

export const WEBSITES_FEATURES_FALLBACK: WebsitesFeaturesContent = {
  heading: 'Create your free website',
  description: 'Save time and simplify how you keep guests in the loop, in one easy place.',
  background_color: '#FCE9C2',
  items: [
    {
      id: 'easy',
      icon: 'sparkles',
      title: 'Easy to set up',
      body: 'Pick a design, add your photo and date, share the link. The whole site is live in under 10 minutes — no tech skills needed.',
      cta_label: 'See how it works',
      cta_href: '#how-it-works',
      visual: 'laptop',
      image_url: '',
    },
    {
      id: 'rsvps',
      icon: 'users',
      title: 'Keep RSVPs simple',
      body: 'Guests RSVP straight from your site. Meal choices, plus-ones and dietary notes flow into your guest dashboard live.',
      cta_label: 'See the RSVP flow',
      cta_href: '/guests-and-rsvp',
      visual: 'rsvp',
      image_url: '',
    },
    {
      id: 'registry',
      icon: 'link',
      title: 'Link any registry',
      body: 'Link to your M-Pesa contribution page, a Tanzanian store registry, or a global gift list — your guests find them in one tap.',
      cta_label: 'Explore registries',
      cta_href: '/registry',
      visual: 'registry',
      image_url: '',
    },
  ],
}

// Stored shape: translatable fields may be a localized { en, sw } object or a
// legacy plain string; non-text fields are scalar. The loader resolves each
// translatable field for `locale` and returns the flat WebsitesFeaturesContent
// the render components already expect.
type StoredWebsitesFeatureItem = {
  id?: string
  icon?: WebsitesFeatureIcon
  title?: MaybeLocalized
  body?: MaybeLocalized
  cta_label?: MaybeLocalized
  cta_href?: string
  visual?: WebsitesFeatureVisual
  image_url?: string
}

type StoredWebsitesFeatures = {
  heading?: MaybeLocalized
  description?: MaybeLocalized
  background_color?: string
  items?: StoredWebsitesFeatureItem[]
}

export async function loadWebsitesFeaturesContent(
  locale: Locale = DEFAULT_LOCALE
): Promise<WebsitesFeaturesContent> {
  if (!process.env.NEXT_PUBLIC_SUPABASE_URL || !process.env.SUPABASE_SERVICE_ROLE_KEY) {
    return WEBSITES_FEATURES_FALLBACK
  }
  try {
    const { isEnabled: isDraft } = await draftMode()
    const supabase = createSupabaseServerClient()
    const { data } = await supabase
      .from('website_page_sections')
      .select('content, draft_content')
      .eq('page_key', 'opus-pass-websites')
      .eq('section_key', 'features')
      .maybeSingle()
    const stored = (isDraft ? data?.draft_content ?? data?.content : data?.content) as
      | StoredWebsitesFeatures
      | undefined
    if (stored) {
      const F = WEBSITES_FEATURES_FALLBACK
      return {
        heading: resolveLocalized(stored.heading ?? F.heading, locale),
        description: resolveLocalized(stored.description ?? F.description, locale),
        background_color: stored.background_color ?? F.background_color,
        items:
          stored.items && Array.isArray(stored.items) && stored.items.length > 0
            ? stored.items.map((it) => ({
                id: it.id ?? '',
                icon: it.icon ?? 'sparkles',
                title: resolveLocalized(it.title, locale),
                body: resolveLocalized(it.body, locale),
                cta_label: resolveLocalized(it.cta_label, locale),
                cta_href: it.cta_href ?? '',
                visual: it.visual ?? 'laptop',
                image_url: it.image_url ?? '',
              }))
            : F.items,
      }
    }
    return WEBSITES_FEATURES_FALLBACK
  } catch (err) {
    console.error('[opus-pass cms] websites-features load failed', err)
    return WEBSITES_FEATURES_FALLBACK
  }
}
