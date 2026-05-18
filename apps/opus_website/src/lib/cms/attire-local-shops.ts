import { createSupabaseServerClient } from '@/lib/supabase'

export type AttireShopItem = { id: string; name: string; img: string; avatar: string }
export type AttireLocalShopsContent = { eyebrow: string; heading: string; cta_label: string; shops: AttireShopItem[] }

export const ATTIRE_LOCAL_SHOPS_FALLBACK: AttireLocalShopsContent = {
  eyebrow: 'Local finds? OpusFesta has it.',
  heading: 'Discover shops in your area',
  cta_label: 'Shop from local makers',
  shops: [
    { id: '1', name: 'Boutique Bridal', avatar: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?auto=format&fit=crop&w=150&q=80', img: 'https://images.unsplash.com/photo-1595777457583-95e059d581b8?auto=format&fit=crop&w=800&q=80' },
    { id: '2', name: 'Diamond District', avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=150&q=80', img: 'https://images.unsplash.com/photo-1511285560929-80b456fea0bc?auto=format&fit=crop&w=800&q=80' },
    { id: '3', name: 'Savile Row Suits', avatar: 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?auto=format&fit=crop&w=150&q=80', img: 'https://images.unsplash.com/photo-1593030761757-71fae45fa0e7?auto=format&fit=crop&w=800&q=80' },
  ],
}

export async function loadAttireLocalShopsContent(): Promise<AttireLocalShopsContent> {
  if (!process.env.NEXT_PUBLIC_SUPABASE_URL || !process.env.SUPABASE_SERVICE_ROLE_KEY) {
    return ATTIRE_LOCAL_SHOPS_FALLBACK
  }
  try {
    const supabase = createSupabaseServerClient()
    const { data } = await supabase
      .from('website_page_sections')
      .select('content')
      .eq('page_key', 'attire-and-rings')
      .eq('section_key', 'local-shops')
      .maybeSingle()
    const stored = data?.content as Partial<AttireLocalShopsContent> | undefined
    if (stored?.shops?.length) {
      return {
        eyebrow: stored.eyebrow ?? ATTIRE_LOCAL_SHOPS_FALLBACK.eyebrow,
        heading: stored.heading ?? ATTIRE_LOCAL_SHOPS_FALLBACK.heading,
        cta_label: stored.cta_label ?? ATTIRE_LOCAL_SHOPS_FALLBACK.cta_label,
        shops: stored.shops,
      }
    }
    return ATTIRE_LOCAL_SHOPS_FALLBACK
  } catch {
    return ATTIRE_LOCAL_SHOPS_FALLBACK
  }
}
