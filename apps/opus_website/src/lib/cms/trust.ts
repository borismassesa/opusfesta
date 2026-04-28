import { createSupabaseServerClient } from '@/lib/supabase'

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
      id: 'trusted',
      icon: 'users',
      title: 'Trusted by millions planning weddings',
      description: 'We help plan over 2 million weddings worldwide every year',
    },
    {
      id: 'verified',
      icon: 'landmark',
      title: 'Verified Vendors',
      description:
        'OpusFesta features only verified, highly-reviewed wedding professionals in your area',
    },
    {
      id: 'support',
      icon: 'headset',
      title: '24/7 expert support',
      description: 'Get help from our wedding concierges anytime over email, phone and chat',
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
      .eq('page_key', 'home')
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
