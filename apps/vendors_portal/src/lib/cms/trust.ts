import { createSupabaseServerClient } from '@/lib/supabase-server'
import { DEFAULT_LOCALE, resolveLocalized, type Locale, type MaybeLocalized } from './localized'

export type TrustIconKey =
  | 'users'
  | 'landmark'
  | 'headset'
  | 'badge-check'
  | 'shield-check'
  | 'award'
  | 'heart-handshake'
  | 'star'
  | 'thumbs-up'
  | 'sparkles'
  | 'lock'
  | 'globe'

// What the render component receives: every translatable field already resolved
// to a flat string in the active locale.
export type TrustItem = {
  id: string
  icon: TrustIconKey
  title: string
  description: string
}

export type TrustContent = {
  items: TrustItem[]
}

// What's stored in the DB: translatable fields may be `{ en, sw }` objects (or
// legacy plain strings). Resolved down to TrustItem at load time.
type StoredTrustItem = Omit<TrustItem, 'title' | 'description'> & {
  title: MaybeLocalized
  description: MaybeLocalized
}

export const TRUST_FALLBACK: TrustContent = {
  items: [
    {
      id: 'reach',
      icon: 'users',
      title: 'Real couples, ready to book',
      description:
        'Get matched with couples who already know what they want — and have the budget to make it happen.',
    },
    {
      id: 'free',
      icon: 'badge-check',
      title: 'Free to start, no setup fees',
      description:
        'Build your storefront in minutes. Pay nothing until you start landing bookings through OpusFesta.',
    },
    {
      id: 'reputation',
      icon: 'star',
      title: 'Your reputation grows you',
      description:
        'Verified reviews from real couples after every event. The better you serve, the higher you rank — your happiest clients become your best marketing.',
    },
  ],
}

export async function loadTrustContent(locale: Locale = DEFAULT_LOCALE): Promise<TrustContent> {
  if (!process.env.NEXT_PUBLIC_SUPABASE_URL || !process.env.SUPABASE_SERVICE_ROLE_KEY) {
    return TRUST_FALLBACK
  }
  try {
    const supabase = createSupabaseServerClient()
    const { data } = await supabase
      .from('website_page_sections')
      .select('content')
      .eq('page_key', 'vendors_home')
      .eq('section_key', 'trust')
      .maybeSingle()
    const stored = data?.content as { items?: StoredTrustItem[] } | undefined
    if (stored && Array.isArray(stored.items) && stored.items.length > 0) {
      // Translatable fields are resolved to the active locale (legacy plain
      // strings render as-is); scalar fields (id, icon) pass through.
      return {
        items: stored.items.map((item) => ({
          id: item.id,
          icon: item.icon,
          title: resolveLocalized(item.title, locale),
          description: resolveLocalized(item.description, locale),
        })),
      }
    }
    return TRUST_FALLBACK
  } catch {
    return TRUST_FALLBACK
  }
}
