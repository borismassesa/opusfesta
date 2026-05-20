import { draftMode } from 'next/headers'
import { createSupabaseServerClient } from '@/lib/supabase'

export type WebsitesTestimonialVariant = 'dark' | 'purple'

export type WebsitesTestimonialItem = {
  id: string
  rating: number
  quote: string
  name: string
  location: string
  avatar: string
  role: string
  variant: WebsitesTestimonialVariant
}

export type WebsitesTestimonialsContent = {
  heading: string
  items: WebsitesTestimonialItem[]
}

export const WEBSITES_TESTIMONIALS_FALLBACK: WebsitesTestimonialsContent = {
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

export async function loadWebsitesTestimonialsContent(): Promise<WebsitesTestimonialsContent> {
  if (!process.env.NEXT_PUBLIC_SUPABASE_URL || !process.env.SUPABASE_SERVICE_ROLE_KEY) {
    return WEBSITES_TESTIMONIALS_FALLBACK
  }
  try {
    const { isEnabled: isDraft } = await draftMode()
    const supabase = createSupabaseServerClient()
    const { data } = await supabase
      .from('website_page_sections')
      .select('content, draft_content')
      .eq('page_key', 'opus-pass-websites')
      .eq('section_key', 'testimonials')
      .maybeSingle()
    const stored = (isDraft ? data?.draft_content ?? data?.content : data?.content) as
      | Partial<WebsitesTestimonialsContent>
      | undefined
    if (stored) {
      return {
        heading: stored.heading ?? WEBSITES_TESTIMONIALS_FALLBACK.heading,
        items:
          stored.items && Array.isArray(stored.items) && stored.items.length > 0
            ? stored.items
            : WEBSITES_TESTIMONIALS_FALLBACK.items,
      }
    }
    return WEBSITES_TESTIMONIALS_FALLBACK
  } catch (err) {
    console.error('[opus-pass cms] websites-testimonials load failed', err)
    return WEBSITES_TESTIMONIALS_FALLBACK
  }
}
