export type OpusPassWebsitesTestimonialVariant = 'dark' | 'purple'

export const OPUS_PASS_WEBSITES_TESTIMONIAL_VARIANTS: OpusPassWebsitesTestimonialVariant[] = [
  'dark',
  'purple',
]

export type OpusPassWebsitesTestimonialItem = {
  id: string
  rating: number
  quote: string
  name: string
  location: string
  avatar: string
  role: string
  variant: OpusPassWebsitesTestimonialVariant
}

export type OpusPassWebsitesTestimonialsContent = {
  heading: string
  items: OpusPassWebsitesTestimonialItem[]
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
  heading: 'What they say about us',
  items: [
    {
      id: 't1',
      rating: 5,
      quote:
        'OpusFesta made planning our wedding a breeze! The checklist kept us sane and the website builder was so fun to use.',
      name: 'Rehema & Bakari',
      location: 'Dar es Salaam',
      avatar: '/assets/images/cutesy_couple.jpg',
      role: 'Couple',
      variant: 'dark',
    },
    {
      id: 't2',
      rating: 4,
      quote:
        'Finding our wedding crew on OpusFesta brought clarity, and our matching site reached far more guests than we expected.',
      name: 'Shirima & Joyce',
      location: 'Zanzibar',
      avatar: '/assets/images/churchcouples.jpg',
      role: 'Couple',
      variant: 'purple',
    },
    {
      id: 't3',
      rating: 5,
      quote:
        'Our digital invite hit every WhatsApp group in ten minutes. The first RSVPs were in by morning — no chasing required.',
      name: 'Neema & Amani',
      location: 'Bagamoyo',
      avatar: '/assets/images/coupleswithpiano.jpg',
      role: 'Newlyweds',
      variant: 'dark',
    },
    {
      id: 't4',
      rating: 5,
      quote:
        'Bilingual invites were the unlock — both sides of the family felt at home on our site. Worth every shilling, and it was free!',
      name: 'Faith & Daniel',
      location: 'Arusha',
      avatar: '/assets/images/authentic_couple.jpg',
      role: 'Couple',
      variant: 'purple',
    },
    {
      id: 't5',
      rating: 5,
      quote:
        'From the save-the-date to thank-yous, every piece matched. Our guests kept asking how we put it all together.',
      name: 'Joyce & Mwita',
      location: 'Mwanza',
      avatar: '/assets/images/mauzo_crew.jpg',
      role: 'Couple',
      variant: 'dark',
    },
  ],
}
