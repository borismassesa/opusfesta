import { createSupabaseServerClient } from '@/lib/supabase-server'
import { DEFAULT_LOCALE, resolveLocalized, type Locale, type MaybeLocalized } from './localized'

export type TestimonialBg = 'dark' | 'accent'
export type TestimonialRole = 'Couple' | 'Vendor'

// What the render component receives: every translatable field already resolved
// to a flat string in the active locale.
export type TestimonialItem = {
  id: string
  name: string
  role: TestimonialRole
  company: string
  city: string
  stars: number
  quote: string
  image_url: string
  bg: TestimonialBg
}

export type TestimonialsContent = {
  headline_line_1: string
  headline_line_2: string
  items: TestimonialItem[]
}

// What's stored in the DB: translatable fields may be `{ en, sw }` objects (or
// legacy plain strings). Resolved down to the flat types above at load time.
type StoredTestimonialItem = Omit<TestimonialItem, 'quote'> & {
  quote: MaybeLocalized
}

type StoredTestimonialsContent = Omit<
  TestimonialsContent,
  'headline_line_1' | 'headline_line_2' | 'items'
> & {
  headline_line_1: MaybeLocalized
  headline_line_2: MaybeLocalized
  items: StoredTestimonialItem[]
}

export const TESTIMONIALS_FALLBACK: TestimonialsContent = {
  headline_line_1: 'Trusted by',
  headline_line_2: 'wedding pros',
  items: [
    { id: 't1', name: 'Michael Osei',    role: 'Vendor', company: 'Osei Photography',       city: 'Zanzibar',      stars: 5, quote: 'OpusFesta brought us consistent bookings from couples who already knew our style. We doubled our revenue in the first six months.', image_url: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=200&q=80', bg: 'dark' },
    { id: 't2', name: 'Aisha Kamau',     role: 'Vendor', company: 'Bloom & Petal Florists', city: 'Nairobi',       stars: 5, quote: 'Managing enquiries used to be chaos across WhatsApp and email. Now leads, quotes and payments all live in one place — I get my evenings back.', image_url: 'https://images.unsplash.com/photo-1488426862026-3ee34a7d66df?auto=format&fit=crop&w=200&q=80', bg: 'accent' },
    { id: 't3', name: 'Lucia Ferreira',  role: 'Vendor', company: 'Golden Hour Venues',     city: 'Moshi',         stars: 5, quote: 'Our venue bookings jumped 60% after joining. The verified badge alone gives couples confidence to reach out without a long back-and-forth.', image_url: 'https://images.unsplash.com/photo-1529626455594-4ff0802cfb7e?auto=format&fit=crop&w=200&q=80', bg: 'dark' },
    { id: 't4', name: 'Kofi Mensah',     role: 'Vendor', company: 'Spice Route Catering',   city: 'Dar es Salaam', stars: 5, quote: 'Mobile-money deposits via OpusFesta closed our cashflow gap overnight. Couples pay faster, and the auto-reminders chase the balance for me.', image_url: 'https://images.unsplash.com/photo-1463453091185-61582044d556?auto=format&fit=crop&w=200&q=80', bg: 'accent' },
    { id: 't5', name: 'Grace Kimathi',   role: 'Vendor', company: 'Grace Bridal Studio',    city: 'Arusha',        stars: 5, quote: 'Setting up my storefront took an afternoon. By the next weekend I had three serious leads — all couples whose date and budget fit my services.', image_url: 'https://images.unsplash.com/photo-1531746020798-e6953c6e8e04?auto=format&fit=crop&w=200&q=80', bg: 'dark' },
    { id: 't6', name: 'Daniel Nkrumah',  role: 'Vendor', company: 'Elegant Strings Band',   city: 'Dodoma',        stars: 5, quote: 'I stopped paying for ads on three different platforms. OpusFesta sends the right couples to me, and I keep more of every booking.', image_url: 'https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?auto=format&fit=crop&w=200&q=80', bg: 'accent' },
  ],
}

export async function loadTestimonialsContent(
  locale: Locale = DEFAULT_LOCALE,
): Promise<TestimonialsContent> {
  if (!process.env.NEXT_PUBLIC_SUPABASE_URL || !process.env.SUPABASE_SERVICE_ROLE_KEY) {
    return TESTIMONIALS_FALLBACK
  }
  try {
    const supabase = createSupabaseServerClient()
    const { data } = await supabase
      .from('website_page_sections')
      .select('content')
      .eq('page_key', 'vendors_home')
      .eq('section_key', 'testimonials')
      .maybeSingle()
    const stored = data?.content as Partial<StoredTestimonialsContent> | undefined
    // Translatable fields are resolved to the active locale (legacy plain
    // strings render as-is). Names, company, city, role, avatars, stars and ids
    // stay scalar. Empty/missing items fall back to the default set.
    if (stored) {
      const items =
        Array.isArray(stored.items) && stored.items.length > 0
          ? stored.items.map((it) => ({
              id: it.id,
              name: it.name,
              role: it.role,
              company: it.company,
              city: it.city,
              stars: it.stars,
              quote: resolveLocalized(it.quote, locale),
              image_url: it.image_url,
              bg: it.bg,
            }))
          : TESTIMONIALS_FALLBACK.items
      return {
        headline_line_1:
          resolveLocalized(stored.headline_line_1, locale) ||
          TESTIMONIALS_FALLBACK.headline_line_1,
        headline_line_2:
          resolveLocalized(stored.headline_line_2, locale) ||
          TESTIMONIALS_FALLBACK.headline_line_2,
        items,
      }
    }
    return TESTIMONIALS_FALLBACK
  } catch {
    return TESTIMONIALS_FALLBACK
  }
}
