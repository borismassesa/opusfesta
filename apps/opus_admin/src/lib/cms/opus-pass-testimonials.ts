import type { MaybeLocalized } from '@/lib/cms/localized'

export type OpusPassTestimonialFg = 'light' | 'dark'

export type OpusPassTestimonialItem = {
  id: string
  // Translatable quote.
  quote: MaybeLocalized
  // Proper name + place name — non-translatable.
  name: string
  location: string
  avatar: string
  bg: string
  fg: OpusPassTestimonialFg
}

export type OpusPassTestimonialsContent = {
  // Translatable copy.
  headline: MaybeLocalized
  description: MaybeLocalized
  cta_label: MaybeLocalized
  // Non-translatable href.
  cta_href: string
  column1: OpusPassTestimonialItem[]
  column2: OpusPassTestimonialItem[]
}

export type OpusPassTestimonialsRow = {
  id: string
  page_key: string
  section_key: string
  content: OpusPassTestimonialsContent
  draft_content: OpusPassTestimonialsContent | null
  is_published: boolean
  updated_at: string
}

export const OPUS_PASS_TESTIMONIALS_FALLBACK: OpusPassTestimonialsContent = {
  headline: 'Couples sharing their OpusPass story.',
  description: 'Real couples, real weddings, real RSVPs — see why OpusPass is loved by couples across East Africa.',
  cta_label: 'Read more stories',
  cta_href: '/reviews',
  column1: [
    {
      id: 'c1-a',
      quote: 'OpusPass made our 200-guest list feel manageable. RSVPs came back in days, not weeks.',
      name: 'Aisha & Hamisi',
      location: 'Dar es Salaam',
      avatar: '/assets/images/authentic_couple.jpg',
      bg: 'bg-[#5d3a78]',
      fg: 'dark',
    },
    {
      id: 'c1-b',
      quote: 'Finally a tool that gets Swahili weddings. The send-off invites were perfect.',
      name: 'Mariam & Salim',
      location: 'Mwanza',
      avatar: '/assets/images/cutesy_couple.jpg',
      bg: 'bg-[#fbeede]',
      fg: 'light',
    },
    {
      id: 'c1-c',
      quote: 'Sent invites at midnight and woke up to 40 RSVPs. Magical.',
      name: 'Doreen & Kelvin',
      location: 'Dodoma',
      avatar: '/assets/images/couples_together.jpg',
      bg: 'bg-[#3f6b3f]',
      fg: 'dark',
    },
    {
      id: 'c1-d',
      quote: 'Our wedding website was up the same day. Guests loved the photo gallery.',
      name: 'Lulu & Daniel',
      location: 'Zanzibar',
      avatar: '/assets/images/coupleswithpiano.jpg',
      bg: 'bg-[#e7c8c8]',
      fg: 'light',
    },
    {
      id: 'c1-e',
      quote: 'From save-the-dates to seating chart, everything stayed in sync. Loved it.',
      name: 'Faraja & Brian',
      location: 'Dar es Salaam',
      avatar: '/assets/images/churchcouples.jpg',
      bg: 'bg-[#1f2a59]',
      fg: 'dark',
    },
  ],
  column2: [
    {
      id: 'c2-a',
      quote: 'Sent our kitchen party invites in a single afternoon. Every aunt got it on WhatsApp.',
      name: 'Neema & Joseph',
      location: 'Arusha',
      avatar: '/assets/images/beautiful_bride.jpg',
      bg: 'bg-[#c47a3a]',
      fg: 'dark',
    },
    {
      id: 'c2-b',
      quote: 'Live RSVPs meant we knew our final guest count two weeks before the wedding.',
      name: 'Grace & Peter',
      location: 'Moshi',
      avatar: '/assets/images/bride_umbrella.jpg',
      bg: 'bg-[#e8d4f2]',
      fg: 'light',
    },
    {
      id: 'c2-c',
      quote: 'Our parents could RSVP straight from WhatsApp. No new apps, no fuss, no calls.',
      name: 'Esther & Tumaini',
      location: 'Tanga',
      avatar: '/assets/images/brideincar.jpg',
      bg: 'bg-[#1f4a47]',
      fg: 'dark',
    },
    {
      id: 'c2-d',
      quote: 'Beautiful templates that respected our culture. Highly recommend OpusPass.',
      name: 'Zawadi & Emmanuel',
      location: 'Morogoro',
      avatar: '/assets/images/beautyinbride.jpg',
      bg: 'bg-[#fbeede]',
      fg: 'light',
    },
  ],
}
