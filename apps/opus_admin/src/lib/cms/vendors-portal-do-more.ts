import type { MaybeLocalized } from './localized'

export type WebsiteTheme = 'cream' | 'forest' | 'dark'
export type GuestStatus = 'Confirmed' | 'Pending' | 'Declined'

export type WebsiteDemo = {
  id: string
  url: string
  initials: MaybeLocalized
  name: MaybeLocalized
  date: MaybeLocalized
  location: MaybeLocalized
  venue: MaybeLocalized
  venue_city: MaybeLocalized
  theme: WebsiteTheme
  countdown_label?: MaybeLocalized
}

export type GuestDemo = {
  id: string
  name: MaybeLocalized
  image_url: string
  status: GuestStatus
}

export type DoMoreContent = {
  // Section header
  headline_line_1: MaybeLocalized
  headline_line_2: MaybeLocalized
  headline_line_3: MaybeLocalized
  side_description: MaybeLocalized
  cta_label: MaybeLocalized
  cta_href: string

  // Card 1 — Website builder demo
  websites_title: MaybeLocalized
  websites_description: MaybeLocalized
  websites_cta: MaybeLocalized
  websites_cta_href: string
  websites: WebsiteDemo[]

  // Card 2 — Guest list demo
  guests_title: MaybeLocalized
  guests_description: MaybeLocalized
  guests_cta: MaybeLocalized
  guests_cta_href: string
  guests_total: number
  guests_confirmed: number
  guests_pending: number
  guests_declined: number
  guests_label_invited: MaybeLocalized
  guests_label_confirmed: MaybeLocalized
  guests_label_pending: MaybeLocalized
  guests_label_declined: MaybeLocalized
  guests: GuestDemo[]
}

export type DoMoreRow = {
  id: string
  page_key: string
  section_key: string
  content: DoMoreContent
  draft_content: DoMoreContent | null
  is_published: boolean
  updated_at: string
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
      id: 'sj',
      url: 'sarahandjames.opusfesta.com',
      initials: 'S & J',
      name: 'Sarah & James',
      date: 'December 14, 2025',
      location: 'The Waterfront · Dar es Salaam',
      venue: 'The Waterfront',
      venue_city: 'Dar es Salaam, Tanzania',
      theme: 'cream',
      countdown_label: 'Days to go',
    },
    {
      id: 'fk',
      url: 'fatumaandkevin.opusfesta.com',
      initials: 'F & K',
      name: 'Fatuma & Kevin',
      date: 'March 2026',
      location: 'Mwanza, Tanzania',
      venue: 'Lake Victoria Resort',
      venue_city: 'Mwanza, Tanzania',
      theme: 'forest',
    },
    {
      id: 'ed',
      url: 'emmadavid.opusfesta.com',
      initials: 'E & D',
      name: 'Emma & David',
      date: 'August 2025',
      location: 'Arusha, Tanzania',
      venue: 'Mount Meru Hotel',
      venue_city: 'Arusha, Tanzania',
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

export const WEBSITE_THEME_OPTIONS: {
  key: WebsiteTheme
  label: string
  swatchBg: string
  swatchText: string
}[] = [
  { key: 'cream', label: 'Cream', swatchBg: '#F8F3EE', swatchText: '#3D2B1F' },
  { key: 'forest', label: 'Forest', swatchBg: '#2A3828', swatchText: '#ffffff' },
  { key: 'dark', label: 'Dark', swatchBg: '#0D0D0D', swatchText: '#ffffff' },
]
