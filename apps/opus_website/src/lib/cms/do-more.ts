import { createSupabaseServerClient } from '@/lib/supabase'

export type WebsiteTheme = 'cream' | 'forest' | 'dark'
export type GuestStatus = 'Confirmed' | 'Pending' | 'Declined'

export type WebsiteDemo = {
  id: string
  url: string
  initials: string
  name: string
  date: string
  location: string
  venue: string
  venue_city: string
  theme: WebsiteTheme
  countdown_label?: string
}

export type GuestDemo = {
  id: string
  name: string
  image_url: string
  status: GuestStatus
}

export type DoMoreContent = {
  headline_line_1: string
  headline_line_2: string
  headline_line_3: string
  side_description: string
  cta_label: string
  cta_href: string
  websites_title: string
  websites_description: string
  websites_cta: string
  websites_cta_href: string
  websites: WebsiteDemo[]
  guests_title: string
  guests_description: string
  guests_cta: string
  guests_cta_href: string
  guests_total: number
  guests_confirmed: number
  guests_pending: number
  guests_declined: number
  guests_label_invited: string
  guests_label_confirmed: string
  guests_label_pending: string
  guests_label_declined: string
  guests: GuestDemo[]
}

export const DO_MORE_FALLBACK: DoMoreContent = {
  headline_line_1: 'More than',
  headline_line_2: 'just finding',
  headline_line_3: 'vendors',
  side_description:
    'Less spreadsheets, less stress. Build your website, track RSVPs, and keep every detail in check. All in one place.',
  cta_label: 'Get started free',
  cta_href: '#',
  websites_title: 'Build your free website',
  websites_description:
    'Get a stunning, personalised wedding website live in minutes. Share your story, collect RSVPs, and keep guests in the loop.',
  websites_cta: 'Explore all templates',
  websites_cta_href: '#',
  websites: [
    {
      id: 'sj', url: 'sarahandjames.opusfesta.com', initials: 'S & J',
      name: 'Sarah & James', date: 'December 14, 2025',
      location: 'The Waterfront · Dar es Salaam',
      venue: 'The Waterfront', venue_city: 'Dar es Salaam, Tanzania',
      theme: 'cream', countdown_label: 'Days to go',
    },
    {
      id: 'fk', url: 'fatumaandkevin.opusfesta.com', initials: 'F & K',
      name: 'Fatuma & Kevin', date: 'March 2026',
      location: 'Mwanza, Tanzania',
      venue: 'Lake Victoria Resort', venue_city: 'Mwanza, Tanzania',
      theme: 'forest',
    },
    {
      id: 'ed', url: 'emmadavid.opusfesta.com', initials: 'E & D',
      name: 'Emma & David', date: 'August 2025',
      location: 'Arusha, Tanzania',
      venue: 'Mount Meru Hotel', venue_city: 'Arusha, Tanzania',
      theme: 'dark',
    },
  ],
  guests_title: 'Manage your guest list',
  guests_description:
    'Invite guests, track RSVPs, send reminders, and manage plus-ones. All in one place.',
  guests_cta: 'Manage guests',
  guests_cta_href: '#',
  guests_total: 100,
  guests_confirmed: 70,
  guests_pending: 25,
  guests_declined: 5,
  guests_label_invited: 'Invited',
  guests_label_confirmed: 'Confirmed',
  guests_label_pending: 'Pending',
  guests_label_declined: 'Declined',
  guests: [
    { id: 'g1', name: 'Sarah Mwangi', image_url: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&w=200&q=80', status: 'Confirmed' },
    { id: 'g2', name: 'Omar Al-Rashid', image_url: 'https://images.unsplash.com/photo-1542103749-8ef59b94f47e?auto=format&fit=crop&w=200&q=80', status: 'Confirmed' },
    { id: 'g3', name: 'Fatuma Hassan', image_url: 'https://images.unsplash.com/photo-1531746020798-e6953c6e8e04?auto=format&fit=crop&w=200&q=80', status: 'Pending' },
    { id: 'g4', name: 'Daniel Nkrumah', image_url: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=200&q=80', status: 'Declined' },
    { id: 'g5', name: 'Aisha Kamau', image_url: 'https://images.unsplash.com/photo-1488426862026-3ee34a7d66df?auto=format&fit=crop&w=200&q=80', status: 'Pending' },
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
      .eq('page_key', 'home')
      .eq('section_key', 'do-more')
      .maybeSingle()
    const stored = data?.content as Partial<DoMoreContent> | undefined
    if (stored) {
      return {
        ...DO_MORE_FALLBACK,
        ...stored,
        websites:
          Array.isArray(stored.websites) && stored.websites.length > 0
            ? (stored.websites as WebsiteDemo[])
            : DO_MORE_FALLBACK.websites,
        guests:
          Array.isArray(stored.guests) && stored.guests.length > 0
            ? (stored.guests as GuestDemo[])
            : DO_MORE_FALLBACK.guests,
      }
    }
    return DO_MORE_FALLBACK
  } catch {
    return DO_MORE_FALLBACK
  }
}

export const WEBSITE_THEME_OPTIONS: { key: WebsiteTheme; label: string; swatchBg: string; swatchText: string }[] = [
  { key: 'cream', label: 'Cream', swatchBg: '#F8F3EE', swatchText: '#3D2B1F' },
  { key: 'forest', label: 'Forest', swatchBg: '#2A3828', swatchText: '#ffffff' },
  { key: 'dark', label: 'Dark', swatchBg: '#0D0D0D', swatchText: '#ffffff' },
]

export type ThemeColors = {
  navBg: string
  navBorder: string
  navText: string
  rsvpBg: string
  rsvpText?: string
  heroBg?: string
  heroGradient?: string
  heroText: string
  heroSub: string
  botanical?: boolean
}

export const THEME_COLORS: Record<WebsiteTheme, ThemeColors> = {
  cream: {
    navBg: '#FAF7F4', navBorder: '#EDE8E2', navText: '#3D3530',
    rsvpBg: '#3D3530',
    heroBg: '#F8F3EE', heroText: '#3D2B1F', heroSub: '#9C7E5E',
    botanical: true,
  },
  forest: {
    navBg: '#EEF2ED', navBorder: '#C8D9C4', navText: '#2A3828',
    rsvpBg: '#2A3828',
    heroGradient: 'linear-gradient(135deg, #2A3828 0%, #4A6B45 60%, #B5C9B0 100%)',
    heroText: '#ffffff', heroSub: 'rgba(255,255,255,0.5)',
  },
  dark: {
    navBg: '#1A1A1A', navBorder: '#333', navText: '#ffffff',
    rsvpBg: '#ffffff', rsvpText: '#1A1A1A',
    heroGradient: 'linear-gradient(135deg, #0D0D0D 0%, #2C2C2C 100%)',
    heroText: '#ffffff', heroSub: 'rgba(255,255,255,0.4)',
  },
}
