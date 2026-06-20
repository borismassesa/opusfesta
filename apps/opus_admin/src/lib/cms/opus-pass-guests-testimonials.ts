import type { MaybeLocalized } from '@/lib/cms/localized'

export type OpusPassGuestsTestimonialFg = 'light' | 'dark'

export type OpusPassGuestsTestimonialItem = {
  id: string
  // Translatable text — stored as { en, sw } (or a legacy plain string).
  quote: MaybeLocalized
  // Non-translatable: proper names, image keys, colour/enum config.
  name: string
  location: string
  avatar: string
  bg: string
  fg: OpusPassGuestsTestimonialFg
}

export type OpusPassGuestsTestimonialsContent = {
  // Translatable text.
  headline: MaybeLocalized
  description: MaybeLocalized
  cta_label: MaybeLocalized
  // Non-translatable config.
  cta_href: string
  column1: OpusPassGuestsTestimonialItem[]
  column2: OpusPassGuestsTestimonialItem[]
}

export type OpusPassGuestsTestimonialsRow = {
  id: string
  page_key: string
  section_key: string
  content: OpusPassGuestsTestimonialsContent
  draft_content: OpusPassGuestsTestimonialsContent | null
  is_published: boolean
  updated_at: string
}

export const OPUS_PASS_GUESTS_TESTIMONIALS_FALLBACK: OpusPassGuestsTestimonialsContent = {
  headline: 'Couples who let OpusPass handle the guest list.',
  description:
    'Real Tanzanian weddings, real RSVPs — see how couples sent invites by WhatsApp and watched replies roll in live.',
  cta_label: 'Read more stories',
  cta_href: '/reviews',
  column1: [
    {
      id: 'gc1-a',
      quote: 'OpusPass made our 200-guest list feel manageable. RSVPs came back in days, not weeks.',
      name: 'Aisha & Hamisi',
      location: 'Dar es Salaam',
      avatar: '/assets/images/authentic_couple.jpg',
      bg: 'bg-[#5d3a78]',
      fg: 'dark',
    },
    {
      id: 'gc1-b',
      quote: 'Finally a tool that gets Swahili weddings. The send-off invites were perfect.',
      name: 'Mariam & Salim',
      location: 'Mwanza',
      avatar: '/assets/images/cutesy_couple.jpg',
      bg: 'bg-[#fbeede]',
      fg: 'light',
    },
    {
      id: 'gc1-c',
      quote: 'Sent invites at midnight and woke up to 40 RSVPs. Magical.',
      name: 'Doreen & Kelvin',
      location: 'Dodoma',
      avatar: '/assets/images/couples_together.jpg',
      bg: 'bg-[#3f6b3f]',
      fg: 'dark',
    },
    {
      id: 'gc1-d',
      quote: 'Our parents could RSVP straight from WhatsApp. No new apps, no fuss, no calls.',
      name: 'Lulu & Daniel',
      location: 'Zanzibar',
      avatar: '/assets/images/coupleswithpiano.jpg',
      bg: 'bg-[#e7c8c8]',
      fg: 'light',
    },
    {
      id: 'gc1-e',
      quote: 'Live counts meant we knew our final guest number two weeks before the wedding.',
      name: 'Faraja & Brian',
      location: 'Dar es Salaam',
      avatar: '/assets/images/churchcouples.jpg',
      bg: 'bg-[#1f2a59]',
      fg: 'dark',
    },
  ],
  column2: [
    {
      id: 'gc2-a',
      quote: 'Sent our kitchen party invites in a single afternoon. Every aunt got it on WhatsApp.',
      name: 'Neema & Joseph',
      location: 'Arusha',
      avatar: '/assets/images/beautiful_bride.jpg',
      bg: 'bg-[#c47a3a]',
      fg: 'dark',
    },
    {
      id: 'gc2-b',
      quote: 'Meal picks and plus-ones all landed in one dashboard. Seating took an evening, not a week.',
      name: 'Grace & Peter',
      location: 'Moshi',
      avatar: '/assets/images/bride_umbrella.jpg',
      bg: 'bg-[#e8d4f2]',
      fg: 'light',
    },
    {
      id: 'gc2-c',
      quote: 'Our planner watched the RSVPs with us on a read-only link. Everyone stayed in sync.',
      name: 'Esther & Tumaini',
      location: 'Tanga',
      avatar: '/assets/images/brideincar.jpg',
      bg: 'bg-[#1f4a47]',
      fg: 'dark',
    },
    {
      id: 'gc2-d',
      quote: 'Beautiful templates that respected our culture. Highly recommend OpusPass.',
      name: 'Zawadi & Emmanuel',
      location: 'Morogoro',
      avatar: '/assets/images/beautyinbride.jpg',
      bg: 'bg-[#fbeede]',
      fg: 'light',
    },
  ],
}
