export type OpusPassGuestsHeroImage = {
  src: string
  alt: string
}

export type OpusPassGuestsHeroContent = {
  headline_lead: string
  headline_highlight: string
  description: string
  primary_cta_label: string
  primary_cta_href: string
  secondary_cta_label: string
  secondary_cta_href: string
  trust_lead: string
  trust_rest: string
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
  headline_lead: 'Your guest list, replying in',
  headline_highlight: 'real time',
  description:
    'Send digital invitations by WhatsApp or SMS and watch the “Joyful yes” replies roll in — a free guest list and bilingual RSVP page in English & Swahili.',
  primary_cta_label: 'Start your guest list',
  primary_cta_href: '/sign-up?redirect_url=%2Fmy%2Fdashboard%3Fseed%3D1',
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
