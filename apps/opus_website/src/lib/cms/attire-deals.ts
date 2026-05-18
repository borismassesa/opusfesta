import { createSupabaseServerClient } from '@/lib/supabase'

export type AttireDealItem = {
  id: string
  name: string
  rating: string
  price: string
  old_price: string
  discount: string
  badge_text: string
  img: string
}

export type AttireDealsContent = { heading: string; items: AttireDealItem[] }

export const ATTIRE_DEALS_FALLBACK: AttireDealsContent = {
  heading: "Today's big deals",
  items: [
    { id: '1', name: 'Vintage Gold Wedding Band', rating: '5.0', price: 'TZS 499,000', old_price: 'TZS 760,000', discount: '35% off', badge_text: 'Biggest sale in 60+ days', img: 'https://images.unsplash.com/photo-1515934751635-c81c6bc9a2d8?auto=format&fit=crop&w=600&q=80' },
    { id: '2', name: "Custom Engraved Men's Band", rating: '4.8', price: 'TZS 156,000', old_price: 'TZS 208,000', discount: '25% off', badge_text: 'Biggest sale in 60+ days', img: 'https://images.unsplash.com/photo-1511285560929-80b456fea0bc?auto=format&fit=crop&w=600&q=80' },
    { id: '3', name: 'Bohemian Lace Wedding Dress', rating: '4.8', price: 'TZS 495,000', old_price: 'TZS 661,000', discount: '25% off', badge_text: 'Biggest sale in 60+ days', img: 'https://images.unsplash.com/photo-1595777457583-95e059d581b8?auto=format&fit=crop&w=600&q=80' },
    { id: '4', name: 'Classic Navy Blue Suit', rating: '4.9', price: 'TZS 265,000', old_price: 'TZS 410,000', discount: '40% off', badge_text: 'Biggest sale in 60+ days', img: 'https://images.unsplash.com/photo-1593030761757-71fae45fa0e7?auto=format&fit=crop&w=600&q=80' },
  ],
}

export async function loadAttireDealsContent(): Promise<AttireDealsContent> {
  if (!process.env.NEXT_PUBLIC_SUPABASE_URL || !process.env.SUPABASE_SERVICE_ROLE_KEY) {
    return ATTIRE_DEALS_FALLBACK
  }
  try {
    const supabase = createSupabaseServerClient()
    const { data } = await supabase
      .from('website_page_sections')
      .select('content')
      .eq('page_key', 'attire-and-rings')
      .eq('section_key', 'deals')
      .maybeSingle()
    const stored = data?.content as Partial<AttireDealsContent> | undefined
    if (stored?.items?.length) {
      return { heading: stored.heading ?? ATTIRE_DEALS_FALLBACK.heading, items: stored.items }
    }
    return ATTIRE_DEALS_FALLBACK
  } catch {
    return ATTIRE_DEALS_FALLBACK
  }
}
