import type { MaybeLocalized } from '@/lib/cms/localized'

export type OpusPassGuestsHeroImage = {
  src: string
  alt: MaybeLocalized
}

export type OpusPassGuestsHeroContent = {
  // Translatable text — stored as { en, sw } (or a legacy plain string).
  headline_line_1: MaybeLocalized
  headline_line_2: MaybeLocalized
  description: MaybeLocalized
  primary_cta_label: MaybeLocalized
  secondary_cta_label: MaybeLocalized
  trust_lead: MaybeLocalized
  trust_rest: MaybeLocalized
  // Non-translatable config.
  primary_cta_href: string
  secondary_cta_href: string
  avatars: string[]
  collage: OpusPassGuestsHeroImage[]
}

export type OpusPassGuestsHeroRow = {
  id: string
  page_key: string
  section_key: string
  content: OpusPassGuestsHeroContent
  draft_content: OpusPassGuestsHeroContent | null
  is_published: boolean
  updated_at: string
}

export const OPUS_PASS_GUESTS_HERO_FALLBACK: OpusPassGuestsHeroContent = {
  headline_line_1: 'Your guest list, replying in',
  headline_line_2: 'real time',
  description:
    'Send digital invitations by WhatsApp or SMS and watch the “Joyful yes” replies roll in — a free guest list and bilingual RSVP page in English & Swahili.',
  primary_cta_label: 'Start your guest list',
  // Straight to the dashboard (/opuspass/my/dashboard via the app's basePath).
  // /my is auth-protected: signed-in couples land directly, signed-out visitors
  // get routed through /sign-in and back. Keep in sync with the opus_pass
  // GUESTS_HERO_FALLBACK so publishing from admin doesn't revert the target.
  primary_cta_href: '/my/dashboard?seed=1',
  secondary_cta_label: 'See how it works',
  secondary_cta_href: '#collection',
  trust_lead: 'Trusted by 500+',
  trust_rest: 'Tanzanian couples',
  avatars: [
    '/assets/images/cutesy_couple.jpg',
    '/assets/images/authentic_couple.jpg',
    '/assets/images/couples_together.jpg',
    '/assets/images/beautiful_bride.jpg',
  ],
  collage: [
    { src: '/assets/images/flowers_pinky.jpg', alt: 'Wedding flowers' },
    { src: '/assets/images/bridering.jpg', alt: 'Wedding rings' },
    { src: '/assets/images/cutesy_couple.jpg', alt: 'A couple celebrating with their guests' },
    { src: '/assets/images/hand_rings.jpg', alt: 'Hands with wedding rings' },
    { src: '/assets/images/authentic_couple.jpg', alt: 'Couple portrait' },
    { src: '/assets/images/coupleswithpiano.jpg', alt: 'Couple at the piano' },
  ],
}
