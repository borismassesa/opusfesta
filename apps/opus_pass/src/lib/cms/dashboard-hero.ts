import { draftMode } from 'next/headers'
import { createSupabaseServerClient } from '@/lib/supabase'

export type DashboardHeroSlug = 'home' | 'invitations' | 'guests' | 'rsvps' | 'website'

export type DashboardHeroMediaType = 'image' | 'video' | 'none'

export interface DashboardHeroContent {
  eyebrow: string
  title: string
  subtitle: string
  media_url: string
  media_type: DashboardHeroMediaType
  media_alt: string
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
  invitations: 'opus-pass-dashboard-invitations',
  guests: 'opus-pass-dashboard-guests',
  rsvps: 'opus-pass-dashboard-rsvps',
  website: 'opus-pass-dashboard-website',
}

export async function loadDashboardHero(slug: DashboardHeroSlug): Promise<DashboardHeroContent> {
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
      | Partial<DashboardHeroContent>
      | undefined
    if (stored) return { ...fallback, ...stored }
    return fallback
  } catch (err) {
    console.error(`[opus-pass cms] dashboard-hero (${slug}) load failed`, err)
    return fallback
  }
}
