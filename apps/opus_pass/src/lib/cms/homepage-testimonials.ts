import { draftMode } from 'next/headers'
import { createSupabaseServerClient } from '@/lib/supabase'
import { DEFAULT_LOCALE, resolveLocalized, type Locale, type MaybeLocalized } from './localized'

export type HomepageTestimonialFg = 'light' | 'dark'

export type HomepageTestimonialItem = {
  id: string
  quote: string
  name: string
  location: string
  avatar: string
  bg: string
  fg: HomepageTestimonialFg
}

export type HomepageTestimonialsContent = {
  headline: string
  description: string
  cta_label: string
  cta_href: string
  column1: HomepageTestimonialItem[]
  column2: HomepageTestimonialItem[]
}

export const HOMEPAGE_TESTIMONIALS_FALLBACK: HomepageTestimonialsContent = {
  headline: 'Couples sharing their OpusPass story.',
  description: 'Real couples, real weddings, real RSVPs — see why OpusPass is loved by couples across East Africa.',
  cta_label: 'Read more stories',
  cta_href: '/reviews',
  column1: [
    { id: 'c1-a', quote: 'OpusPass made our 200-guest list feel manageable. RSVPs came back in days, not weeks.', name: 'Aisha & Hamisi', location: 'Dar es Salaam', avatar: '/assets/images/authentic_couple.jpg', bg: 'bg-[#5d3a78]', fg: 'dark' },
    { id: 'c1-b', quote: 'Finally a tool that gets Swahili weddings. The send-off invites were perfect.', name: 'Mariam & Salim', location: 'Mwanza', avatar: '/assets/images/cutesy_couple.jpg', bg: 'bg-[#fbeede]', fg: 'light' },
    { id: 'c1-c', quote: 'Sent invites at midnight and woke up to 40 RSVPs. Magical.', name: 'Doreen & Kelvin', location: 'Dodoma', avatar: '/assets/images/couples_together.jpg', bg: 'bg-[#3f6b3f]', fg: 'dark' },
    { id: 'c1-d', quote: 'Our wedding website was up the same day. Guests loved the photo gallery.', name: 'Lulu & Daniel', location: 'Zanzibar', avatar: '/assets/images/coupleswithpiano.jpg', bg: 'bg-[#e7c8c8]', fg: 'light' },
    { id: 'c1-e', quote: 'From save-the-dates to seating chart, everything stayed in sync. Loved it.', name: 'Faraja & Brian', location: 'Dar es Salaam', avatar: '/assets/images/churchcouples.jpg', bg: 'bg-[#1f2a59]', fg: 'dark' },
  ],
  column2: [
    { id: 'c2-a', quote: 'Sent our kitchen party invites in a single afternoon. Every aunt got it on WhatsApp.', name: 'Neema & Joseph', location: 'Arusha', avatar: '/assets/images/beautiful_bride.jpg', bg: 'bg-[#c47a3a]', fg: 'dark' },
    { id: 'c2-b', quote: 'Live RSVPs meant we knew our final guest count two weeks before the wedding.', name: 'Grace & Peter', location: 'Moshi', avatar: '/assets/images/bride_umbrella.jpg', bg: 'bg-[#e8d4f2]', fg: 'light' },
    { id: 'c2-c', quote: 'Our parents could RSVP straight from WhatsApp. No new apps, no fuss, no calls.', name: 'Esther & Tumaini', location: 'Tanga', avatar: '/assets/images/brideincar.jpg', bg: 'bg-[#1f4a47]', fg: 'dark' },
    { id: 'c2-d', quote: 'Beautiful templates that respected our culture. Highly recommend OpusPass.', name: 'Zawadi & Emmanuel', location: 'Morogoro', avatar: '/assets/images/beautyinbride.jpg', bg: 'bg-[#fbeede]', fg: 'light' },
  ],
}

// Stored shape: translatable fields may be a localized { en, sw } object or a
// legacy plain string; names, locations, avatars, colours and the href are
// scalar. The loader resolves each translatable field for `locale` and returns
// the flat HomepageTestimonialsContent the render components already expect.
type StoredTestimonialItem = {
  id?: string
  quote?: MaybeLocalized
  name?: string
  location?: string
  avatar?: string
  bg?: string
  fg?: HomepageTestimonialFg
}
type StoredHomepageTestimonials = {
  headline?: MaybeLocalized
  description?: MaybeLocalized
  cta_label?: MaybeLocalized
  cta_href?: string
  column1?: StoredTestimonialItem[]
  column2?: StoredTestimonialItem[]
}

function resolveItem(item: StoredTestimonialItem, locale: Locale, i: number): HomepageTestimonialItem {
  return {
    id: item.id ?? `t-${i}`,
    quote: resolveLocalized(item.quote, locale),
    name: item.name ?? '',
    location: item.location ?? '',
    avatar: item.avatar ?? '',
    bg: item.bg ?? 'bg-white',
    fg: item.fg ?? 'light',
  }
}

export async function loadHomepageTestimonialsContent(
  locale: Locale = DEFAULT_LOCALE
): Promise<HomepageTestimonialsContent> {
  if (!process.env.NEXT_PUBLIC_SUPABASE_URL || !process.env.SUPABASE_SERVICE_ROLE_KEY) {
    return HOMEPAGE_TESTIMONIALS_FALLBACK
  }
  try {
    const { isEnabled: isDraft } = await draftMode()
    const supabase = createSupabaseServerClient()
    const { data } = await supabase
      .from('website_page_sections')
      .select('content, draft_content')
      .eq('page_key', 'opus-pass-homepage')
      .eq('section_key', 'testimonials')
      .maybeSingle()
    const stored = (isDraft ? data?.draft_content ?? data?.content : data?.content) as
      | StoredHomepageTestimonials
      | undefined
    if (stored) {
      const F = HOMEPAGE_TESTIMONIALS_FALLBACK
      return {
        headline: resolveLocalized(stored.headline ?? F.headline, locale),
        description: resolveLocalized(stored.description ?? F.description, locale),
        cta_label: resolveLocalized(stored.cta_label ?? F.cta_label, locale),
        cta_href: stored.cta_href ?? F.cta_href,
        column1:
          stored.column1 && Array.isArray(stored.column1) && stored.column1.length > 0
            ? stored.column1.map((t, i) => resolveItem(t, locale, i))
            : F.column1,
        column2:
          stored.column2 && Array.isArray(stored.column2) && stored.column2.length > 0
            ? stored.column2.map((t, i) => resolveItem(t, locale, i))
            : F.column2,
      }
    }
    return HOMEPAGE_TESTIMONIALS_FALLBACK
  } catch (err) {
    console.error('[opus-pass cms] homepage-testimonials load failed', err)
    return HOMEPAGE_TESTIMONIALS_FALLBACK
  }
}
