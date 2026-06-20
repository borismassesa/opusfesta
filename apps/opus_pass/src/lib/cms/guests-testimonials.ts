import { draftMode } from 'next/headers'
import { createSupabaseServerClient } from '@/lib/supabase'
import { DEFAULT_LOCALE, resolveLocalized, type Locale, type MaybeLocalized } from './localized'

export type GuestsTestimonialFg = 'light' | 'dark'

export type GuestsTestimonialItem = {
  id: string
  quote: string
  name: string
  location: string
  avatar: string
  bg: string
  fg: GuestsTestimonialFg
}

export type GuestsTestimonialsContent = {
  headline: string
  description: string
  cta_label: string
  cta_href: string
  column1: GuestsTestimonialItem[]
  column2: GuestsTestimonialItem[]
}

export const GUESTS_TESTIMONIALS_FALLBACK: GuestsTestimonialsContent = {
  headline: 'Couples who let OpusPass handle the guest list.',
  description:
    'Real Tanzanian weddings, real RSVPs — see how couples sent invites by WhatsApp and watched replies roll in live.',
  cta_label: 'Read more stories',
  cta_href: '/reviews',
  column1: [
    { id: 'gc1-a', quote: 'OpusPass made our 200-guest list feel manageable. RSVPs came back in days, not weeks.', name: 'Aisha & Hamisi', location: 'Dar es Salaam', avatar: '/assets/images/authentic_couple.jpg', bg: 'bg-[#5d3a78]', fg: 'dark' },
    { id: 'gc1-b', quote: 'Finally a tool that gets Swahili weddings. The send-off invites were perfect.', name: 'Mariam & Salim', location: 'Mwanza', avatar: '/assets/images/cutesy_couple.jpg', bg: 'bg-[#fbeede]', fg: 'light' },
    { id: 'gc1-c', quote: 'Sent invites at midnight and woke up to 40 RSVPs. Magical.', name: 'Doreen & Kelvin', location: 'Dodoma', avatar: '/assets/images/couples_together.jpg', bg: 'bg-[#3f6b3f]', fg: 'dark' },
    { id: 'gc1-d', quote: 'Our parents could RSVP straight from WhatsApp. No new apps, no fuss, no calls.', name: 'Lulu & Daniel', location: 'Zanzibar', avatar: '/assets/images/coupleswithpiano.jpg', bg: 'bg-[#e7c8c8]', fg: 'light' },
    { id: 'gc1-e', quote: 'Live counts meant we knew our final guest number two weeks before the wedding.', name: 'Faraja & Brian', location: 'Dar es Salaam', avatar: '/assets/images/churchcouples.jpg', bg: 'bg-[#1f2a59]', fg: 'dark' },
  ],
  column2: [
    { id: 'gc2-a', quote: 'Sent our kitchen party invites in a single afternoon. Every aunt got it on WhatsApp.', name: 'Neema & Joseph', location: 'Arusha', avatar: '/assets/images/beautiful_bride.jpg', bg: 'bg-[#c47a3a]', fg: 'dark' },
    { id: 'gc2-b', quote: 'Meal picks and plus-ones all landed in one dashboard. Seating took an evening, not a week.', name: 'Grace & Peter', location: 'Moshi', avatar: '/assets/images/bride_umbrella.jpg', bg: 'bg-[#e8d4f2]', fg: 'light' },
    { id: 'gc2-c', quote: 'Our planner watched the RSVPs with us on a read-only link. Everyone stayed in sync.', name: 'Esther & Tumaini', location: 'Tanga', avatar: '/assets/images/brideincar.jpg', bg: 'bg-[#1f4a47]', fg: 'dark' },
    { id: 'gc2-d', quote: 'Beautiful templates that respected our culture. Highly recommend OpusPass.', name: 'Zawadi & Emmanuel', location: 'Morogoro', avatar: '/assets/images/beautyinbride.jpg', bg: 'bg-[#fbeede]', fg: 'light' },
  ],
}

// Stored shape: translatable text (headline, description, cta_label, each item
// quote) may be a localized { en, sw } object or a legacy plain string. The
// proper names (name, location), URLs, image keys and colour/enum fields stay
// scalar. The loader resolves each translatable field for `locale` and returns
// the flat GuestsTestimonialsContent the render components already expect.
type StoredGuestsTestimonialItem = {
  id?: string
  quote?: MaybeLocalized
  name?: string
  location?: string
  avatar?: string
  bg?: string
  fg?: GuestsTestimonialFg
}

type StoredGuestsTestimonials = {
  headline?: MaybeLocalized
  description?: MaybeLocalized
  cta_label?: MaybeLocalized
  cta_href?: string
  column1?: StoredGuestsTestimonialItem[]
  column2?: StoredGuestsTestimonialItem[]
}

function resolveColumn(
  items: StoredGuestsTestimonialItem[] | undefined,
  fallback: GuestsTestimonialItem[],
  locale: Locale
): GuestsTestimonialItem[] {
  if (!items || !Array.isArray(items) || items.length === 0) return fallback
  return items.map((item, i) => ({
    id: item.id ?? fallback[i]?.id ?? `t-${i}`,
    quote: resolveLocalized(item.quote, locale),
    name: item.name ?? '',
    location: item.location ?? '',
    avatar: item.avatar ?? '',
    bg: item.bg ?? 'bg-white',
    fg: item.fg ?? 'light',
  }))
}

export async function loadGuestsTestimonialsContent(
  locale: Locale = DEFAULT_LOCALE
): Promise<GuestsTestimonialsContent> {
  if (!process.env.NEXT_PUBLIC_SUPABASE_URL || !process.env.SUPABASE_SERVICE_ROLE_KEY) {
    return GUESTS_TESTIMONIALS_FALLBACK
  }
  try {
    const { isEnabled: isDraft } = await draftMode()
    const supabase = createSupabaseServerClient()
    const { data } = await supabase
      .from('website_page_sections')
      .select('content, draft_content')
      .eq('page_key', 'opus-pass-guests')
      .eq('section_key', 'testimonials')
      .maybeSingle()
    const stored = (isDraft ? data?.draft_content ?? data?.content : data?.content) as
      | StoredGuestsTestimonials
      | undefined
    if (stored) {
      const F = GUESTS_TESTIMONIALS_FALLBACK
      return {
        headline: resolveLocalized(stored.headline ?? F.headline, locale),
        description: resolveLocalized(stored.description ?? F.description, locale),
        cta_label: resolveLocalized(stored.cta_label ?? F.cta_label, locale),
        cta_href: stored.cta_href ?? F.cta_href,
        column1: resolveColumn(stored.column1, F.column1, locale),
        column2: resolveColumn(stored.column2, F.column2, locale),
      }
    }
    return GUESTS_TESTIMONIALS_FALLBACK
  } catch (err) {
    console.error('[opus-pass cms] guests-testimonials load failed', err)
    return GUESTS_TESTIMONIALS_FALLBACK
  }
}
