// Mirrors the public WebsitesTestimonialsContent — the /websites testimonials
// wall is the shared <InvitationShowcase> (two scrolling columns of cards), so
// the shape matches the homepage & guests testimonials editors.
export type OpusPassWebsitesTestimonialFg = 'light' | 'dark'

export type OpusPassWebsitesTestimonialItem = {
  id: string
  quote: string
  name: string
  location: string
  avatar: string
  bg: string
  fg: OpusPassWebsitesTestimonialFg
}

export type OpusPassWebsitesTestimonialsContent = {
  headline: string
  description: string
  cta_label: string
  cta_href: string
  column1: OpusPassWebsitesTestimonialItem[]
  column2: OpusPassWebsitesTestimonialItem[]
}

export type OpusPassWebsitesTestimonialsRow = {
  id: string
  page_key: string
  section_key: string
  content: OpusPassWebsitesTestimonialsContent
  draft_content: OpusPassWebsitesTestimonialsContent | null
  is_published: boolean
  updated_at: string
}

export const OPUS_PASS_WEBSITES_TESTIMONIALS_FALLBACK: OpusPassWebsitesTestimonialsContent = {
  headline: 'Couples who built their site with OpusPass.',
  description:
    'One link, every detail — see how couples shared their story, venue and live updates with a free OpusPass wedding website.',
  cta_label: 'Read more stories',
  cta_href: '/reviews',
  column1: [
    {
      id: 'wc1-a',
      quote: 'Our wedding website was up the same day. Guests loved the photo gallery and travel info.',
      name: 'Rehema & Bakari',
      location: 'Dar es Salaam',
      avatar: '/assets/images/cutesy_couple.jpg',
      bg: 'bg-[#5d3a78]',
      fg: 'dark',
    },
    {
      id: 'wc1-b',
      quote: 'Bilingual pages meant both sides of the family felt at home — and it was completely free.',
      name: 'Faith & Daniel',
      location: 'Arusha',
      avatar: '/assets/images/authentic_couple.jpg',
      bg: 'bg-[#fbeede]',
      fg: 'light',
    },
    {
      id: 'wc1-c',
      quote: 'We changed the venue once and the site updated instantly. No reprints, no panic.',
      name: 'Neema & Amani',
      location: 'Bagamoyo',
      avatar: '/assets/images/coupleswithpiano.jpg',
      bg: 'bg-[#3f6b3f]',
      fg: 'dark',
    },
    {
      id: 'wc1-d',
      quote: 'From save-the-date to thank-yous, every page matched our invitations beautifully.',
      name: 'Joyce & Mwita',
      location: 'Mwanza',
      avatar: '/assets/images/churchcouples.jpg',
      bg: 'bg-[#e7c8c8]',
      fg: 'light',
    },
  ],
  column2: [
    {
      id: 'wc2-a',
      quote: 'One link in our WhatsApp groups and everyone had the schedule, the map and the RSVP.',
      name: 'Shirima & Joyce',
      location: 'Zanzibar',
      avatar: '/assets/images/beautiful_bride.jpg',
      bg: 'bg-[#c47a3a]',
      fg: 'dark',
    },
    {
      id: 'wc2-b',
      quote: 'The registry link sat right on the site, so gifting was effortless for our guests.',
      name: 'Grace & Peter',
      location: 'Moshi',
      avatar: '/assets/images/bride_umbrella.jpg',
      bg: 'bg-[#e8d4f2]',
      fg: 'light',
    },
    {
      id: 'wc2-c',
      quote: 'Live updates on the site meant no last-minute phone calls. Everyone just checked the link.',
      name: 'Esther & Tumaini',
      location: 'Tanga',
      avatar: '/assets/images/brideincar.jpg',
      bg: 'bg-[#1f4a47]',
      fg: 'dark',
    },
    {
      id: 'wc2-d',
      quote: 'A beautiful site in minutes, free with our pass. Our guests kept asking how we did it.',
      name: 'Zawadi & Emmanuel',
      location: 'Morogoro',
      avatar: '/assets/images/beautyinbride.jpg',
      bg: 'bg-[#fbeede]',
      fg: 'light',
    },
  ],
}
