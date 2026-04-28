export type TestimonialBg = 'dark' | 'accent'
export type TestimonialRole = 'Couple' | 'Vendor'

export type TestimonialItem = {
  id: string
  name: string
  role: TestimonialRole
  company: string
  city: string
  stars: number // 1-5
  quote: string
  image_url: string
  bg: TestimonialBg
}

export type TestimonialsContent = {
  headline_line_1: string
  headline_line_2: string
  items: TestimonialItem[]
}

export type TestimonialsRow = {
  id: string
  page_key: string
  section_key: string
  content: TestimonialsContent
  draft_content: TestimonialsContent | null
  is_published: boolean
  updated_at: string
}

export const TESTIMONIALS_FALLBACK: TestimonialsContent = {
  headline_line_1: 'What they say',
  headline_line_2: 'about us',
  items: [
    { id: 't1', name: 'Sarah Mwangi',    role: 'Couple', company: 'Sarah & James',         city: 'Dar es Salaam', stars: 5, quote: 'OpusFesta made planning our wedding a breeze! The checklist kept us sane and the website builder was so fun to use.', image_url: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&w=200&q=80', bg: 'dark' },
    { id: 't2', name: 'Michael Osei',    role: 'Vendor', company: 'Osei Photography',      city: 'Zanzibar',      stars: 4, quote: 'Finding couples was never this easy. OpusFesta brought us consistent bookings and our profile gets seen by the right people.', image_url: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=200&q=80', bg: 'accent' },
    { id: 't3', name: 'Emma Lindqvist',  role: 'Couple', company: 'Emma & David',          city: 'Arusha',        stars: 5, quote: 'The universal registry is a game changer. We added gifts from 5 different stores and a honeymoon fund without any extra fees.', image_url: 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?auto=format&fit=crop&w=200&q=80', bg: 'dark' },
    { id: 't4', name: 'Fatuma Hassan',   role: 'Couple', company: 'Fatuma & Kevin',        city: 'Mwanza',        stars: 5, quote: 'I was overwhelmed before OpusFesta. The budget planner alone saved us from going over by TZS 5 million. Absolute lifesaver.', image_url: 'https://images.unsplash.com/photo-1531746020798-e6953c6e8e04?auto=format&fit=crop&w=200&q=80', bg: 'accent' },
    { id: 't5', name: 'Aisha Kamau',     role: 'Vendor', company: 'Bloom & Petal Florists', city: 'Nairobi',       stars: 4, quote: 'As a florist, managing enquiries used to be chaos. OpusFesta streamlined everything: bookings, messages, payments, all in one place.', image_url: 'https://images.unsplash.com/photo-1488426862026-3ee34a7d66df?auto=format&fit=crop&w=200&q=80', bg: 'dark' },
    { id: 't6', name: 'Daniel Nkrumah',  role: 'Couple', company: 'Daniel & Grace',        city: 'Dodoma',        stars: 5, quote: 'We found our caterer and florist through OpusFesta in Dar es Salaam. Both verified, responsive and fairly priced.', image_url: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=200&q=80', bg: 'accent' },
    { id: 't7', name: 'Lucia Ferreira',  role: 'Vendor', company: 'Golden Hour Venues',    city: 'Moshi',         stars: 4, quote: 'Our venue bookings increased by 60% since joining OpusFesta. The verified badge alone gives couples so much confidence to reach out.', image_url: 'https://images.unsplash.com/photo-1529626455594-4ff0802cfb7e?auto=format&fit=crop&w=200&q=80', bg: 'dark' },
    { id: 't8', name: 'Omar Al-Rashid',  role: 'Couple', company: 'Omar & Priya',          city: 'Dar es Salaam', stars: 5, quote: "Comparing vendor packages side-by-side saved us so much time. The pricing transparency was something we'd never found before.", image_url: 'https://images.unsplash.com/photo-1542103749-8ef59b94f47e?auto=format&fit=crop&w=200&q=80', bg: 'accent' },
  ],
}
