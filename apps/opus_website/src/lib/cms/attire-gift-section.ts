import { createSupabaseServerClient } from '@/lib/supabase'

export type AttireGiftItem = { id: string; name: string; img: string }
export type AttireGiftSectionContent = { heading: string; cta_label: string; gifts: AttireGiftItem[] }

export const ATTIRE_GIFT_SECTION_FALLBACK: AttireGiftSectionContent = {
  heading: 'OpusFesta-special rings & wedding attire',
  cta_label: 'Get inspired',
  gifts: [
    { id: '1', name: 'Diamond Engagement Rings', img: 'https://images.unsplash.com/photo-1511285560929-80b456fea0bc?auto=format&fit=crop&w=600&q=80' },
    { id: '2', name: 'Vintage Wedding Dresses', img: 'https://images.unsplash.com/photo-1595777457583-95e059d581b8?auto=format&fit=crop&w=600&q=80' },
    { id: '3', name: 'Designer Tuxedos', img: 'https://images.unsplash.com/photo-1593030761757-71fae45fa0e7?auto=format&fit=crop&w=600&q=80' },
  ],
}

export async function loadAttireGiftSectionContent(): Promise<AttireGiftSectionContent> {
  if (!process.env.NEXT_PUBLIC_SUPABASE_URL || !process.env.SUPABASE_SERVICE_ROLE_KEY) {
    return ATTIRE_GIFT_SECTION_FALLBACK
  }
  try {
    const supabase = createSupabaseServerClient()
    const { data } = await supabase
      .from('website_page_sections')
      .select('content')
      .eq('page_key', 'attire-and-rings')
      .eq('section_key', 'gift-section')
      .maybeSingle()
    const stored = data?.content as Partial<AttireGiftSectionContent> | undefined
    if (stored?.gifts?.length) {
      return {
        heading: stored.heading ?? ATTIRE_GIFT_SECTION_FALLBACK.heading,
        cta_label: stored.cta_label ?? ATTIRE_GIFT_SECTION_FALLBACK.cta_label,
        gifts: stored.gifts,
      }
    }
    return ATTIRE_GIFT_SECTION_FALLBACK
  } catch {
    return ATTIRE_GIFT_SECTION_FALLBACK
  }
}
