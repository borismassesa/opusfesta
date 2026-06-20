import { draftMode } from 'next/headers'
import { createSupabaseServerClient } from '@/lib/supabase'
import { DEFAULT_LOCALE, resolveLocalized, type Locale, type MaybeLocalized } from './localized'

export type DashboardHeroSlug =
  | 'home'
  | 'pledges'
  | 'invitations'
  | 'guests'
  | 'rsvps'
  | 'website'

export type DashboardHeroMediaType = 'image' | 'video' | 'none'

// Resolved (rendered) shape — translatable fields are flat strings for the locale,
// so the render components stay unchanged.
export interface DashboardHeroContent {
  eyebrow: string
  title: string
  subtitle: string
  media_url: string
  media_type: DashboardHeroMediaType
  media_alt: string
}

// Stored shape: translatable fields may be a localized { en, sw } object or a
// legacy plain string. The loader resolves each for `locale`.
type StoredDashboardHero = {
  eyebrow?: MaybeLocalized
  title?: MaybeLocalized
  subtitle?: MaybeLocalized
  media_alt?: MaybeLocalized
  media_url?: string
  media_type?: DashboardHeroMediaType
}

export const DASHBOARD_HERO_FALLBACKS: Record<DashboardHeroSlug, DashboardHeroContent> = {
  home: {
    eyebrow: 'Dashboard',
    title: 'Welcome back',
    subtitle: "Plan, send and track everything in one place. Here's how your wedding is shaping up.",
    media_url: '',
    media_type: 'none',
    media_alt: '',
  },
  pledges: {
    eyebrow: 'Pledges',
    title: 'Contributions & pledges',
    subtitle:
      'Invite people to pledge, chase follow-ups, record who has paid, then confirm who’s coming.',
    media_url: '',
    media_type: 'none',
    media_alt: '',
  },
  invitations: {
    eyebrow: 'Invitations',
    title: 'Send invitations',
    subtitle: "Share each guest's personal RSVP link — no app needed on their end.",
    media_url: '',
    media_type: 'none',
    media_alt: '',
  },
  guests: {
    eyebrow: 'Guest list',
    title: 'Your guest list',
    subtitle: 'Add, group and edit guests, then import contacts from a spreadsheet.',
    media_url: '',
    media_type: 'none',
    media_alt: '',
  },
  rsvps: {
    eyebrow: 'RSVPs',
    title: "Who's coming",
    subtitle: 'Live replies, meal preferences and dietary notes — all in one place.',
    media_url: '',
    media_type: 'none',
    media_alt: '',
  },
  website: {
    eyebrow: 'Wedding website',
    title: 'Your wedding website',
    subtitle:
      'A shareable home for your story, event details and live RSVP — pick a design that fits.',
    media_url: '',
    media_type: 'none',
    media_alt: '',
  },
}

export const DASHBOARD_HERO_PAGE_KEY: Record<DashboardHeroSlug, string> = {
  home: 'opus-pass-dashboard-home',
  pledges: 'opus-pass-dashboard-pledges',
  invitations: 'opus-pass-dashboard-invitations',
  guests: 'opus-pass-dashboard-guests',
  rsvps: 'opus-pass-dashboard-rsvps',
  website: 'opus-pass-dashboard-website',
}

export async function loadDashboardHero(
  slug: DashboardHeroSlug,
  locale: Locale = DEFAULT_LOCALE,
): Promise<DashboardHeroContent> {
  const fallback = DASHBOARD_HERO_FALLBACKS[slug]
  if (!process.env.NEXT_PUBLIC_SUPABASE_URL || !process.env.SUPABASE_SERVICE_ROLE_KEY) {
    return fallback
  }
  try {
    const { isEnabled: isDraft } = await draftMode()
    const supabase = createSupabaseServerClient()
    const { data, error } = await supabase
      .from('website_page_sections')
      .select('content, draft_content')
      .eq('page_key', DASHBOARD_HERO_PAGE_KEY[slug])
      .eq('section_key', 'hero')
      .maybeSingle()
    if (error) {
      console.error(`[opus-pass cms] dashboard-hero (${slug}) query failed`, error)
      return fallback
    }
    const stored = (isDraft ? data?.draft_content ?? data?.content : data?.content) as
      | StoredDashboardHero
      | undefined
    if (stored) {
      // Map fields explicitly (not a blind spread): translatable fields resolve to
      // `locale`, scalar config falls back per-key. Returns flat strings so the
      // render components need no changes.
      return {
        eyebrow: resolveLocalized(stored.eyebrow ?? fallback.eyebrow, locale),
        title: resolveLocalized(stored.title ?? fallback.title, locale),
        subtitle: resolveLocalized(stored.subtitle ?? fallback.subtitle, locale),
        media_alt: resolveLocalized(stored.media_alt ?? fallback.media_alt, locale),
        media_url: stored.media_url ?? fallback.media_url,
        media_type: stored.media_type ?? fallback.media_type,
      }
    }
    return fallback
  } catch (err) {
    console.error(`[opus-pass cms] dashboard-hero (${slug}) load failed`, err)
    return fallback
  }
}
