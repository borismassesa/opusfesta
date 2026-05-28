// Shared types / fallbacks / page-key map for the 5 OpusPass dashboard hero CMS pages.
// Editor lives at apps/opus_admin/src/app/(admin)/cms/opus-pass/dashboard/[page]/hero/.
// Loader on the OpusPass side lives at apps/opus_pass/src/lib/cms/dashboard-hero.ts.

export type DashboardHeroSlug = 'home' | 'invitations' | 'guests' | 'rsvps' | 'website'

export type DashboardHeroMediaType = 'image' | 'video' | 'none'

export type DashboardHeroContent = {
  eyebrow: string
  title: string
  subtitle: string
  media_url: string
  media_type: DashboardHeroMediaType
  media_alt: string
}

export type DashboardHeroRow = {
  id: string
  page_key: string
  section_key: string
  content: DashboardHeroContent
  draft_content: DashboardHeroContent | null
  is_published: boolean
  updated_at: string
}

export const DASHBOARD_HERO_FALLBACK: Record<DashboardHeroSlug, DashboardHeroContent> = {
  home: {
    eyebrow: 'Dashboard',
    title: 'Welcome back',
    subtitle:
      "Plan, send and track everything in one place. Here's how your wedding is shaping up.",
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

export const DASHBOARD_HERO_PUBLIC_PATH: Record<DashboardHeroSlug, string> = {
  home: '/my/dashboard',
  invitations: '/my/dashboard/invitations',
  guests: '/my/dashboard/guests',
  rsvps: '/my/dashboard/rsvps',
  website: '/my/dashboard/website',
}

export const DASHBOARD_HERO_LABEL: Record<DashboardHeroSlug, string> = {
  home: 'Dashboard home',
  invitations: 'Invitations',
  guests: 'Guest list',
  rsvps: 'RSVPs',
  website: 'Wedding website',
}

export const DASHBOARD_HERO_SLUGS: readonly DashboardHeroSlug[] = [
  'home',
  'invitations',
  'guests',
  'rsvps',
  'website',
] as const

export function isDashboardHeroSlug(value: string): value is DashboardHeroSlug {
  return (DASHBOARD_HERO_SLUGS as readonly string[]).includes(value)
}
