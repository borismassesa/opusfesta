import { createSupabaseServerClient } from '@/lib/supabase-server'

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

export type TrustItem = {
  id: string
  icon: TrustIconKey
  title: string
  description: string
}

export type TrustContent = {
  items: TrustItem[]
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

export async function loadTrustContent(): Promise<TrustContent> {
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
    const stored = data?.content as Partial<TrustContent> | undefined
    if (stored && Array.isArray(stored.items) && stored.items.length > 0) {
      return { items: stored.items as TrustItem[] }
    }
    return TRUST_FALLBACK
  } catch {
    return TRUST_FALLBACK
  }
}
