import { createSupabaseServerClient } from '@/lib/supabase'

export type AttireAccessoryItem = { id: string; name: string; img: string }
export type AttireAccessoriesContent = { heading: string; items: AttireAccessoryItem[] }

export const ATTIRE_ACCESSORIES_FALLBACK: AttireAccessoriesContent = {
  heading: 'Accessories to complete the look',
  items: [
    { id: '1', name: 'Bridal Veils', img: 'https://images.unsplash.com/photo-1606800052052-a08af7148866?auto=format&fit=crop&w=200&q=80' },
    { id: '2', name: 'Wedding Shoes', img: 'https://images.unsplash.com/photo-1543163521-1bf539c55dd2?auto=format&fit=crop&w=200&q=80' },
    { id: '3', name: 'Groom Watches', img: 'https://images.unsplash.com/photo-1523275335684-37898b6baf30?auto=format&fit=crop&w=200&q=80' },
    { id: '4', name: 'Bridesmaid Dresses', img: 'https://images.unsplash.com/photo-1591604466107-ec97de577aff?auto=format&fit=crop&w=200&q=80' },
    { id: '5', name: 'Groomsmen Ties', img: 'https://images.unsplash.com/photo-1589756823695-278bc923f962?auto=format&fit=crop&w=200&q=80' },
  ],
}

export async function loadAttireAccessoriesContent(): Promise<AttireAccessoriesContent> {
  if (!process.env.NEXT_PUBLIC_SUPABASE_URL || !process.env.SUPABASE_SERVICE_ROLE_KEY) {
    return ATTIRE_ACCESSORIES_FALLBACK
  }
  try {
    const supabase = createSupabaseServerClient()
    const { data } = await supabase
      .from('website_page_sections')
      .select('content')
      .eq('page_key', 'attire-and-rings')
      .eq('section_key', 'accessories')
      .maybeSingle()
    const stored = data?.content as Partial<AttireAccessoriesContent> | undefined
    if (stored?.items?.length) {
      return { heading: stored.heading ?? ATTIRE_ACCESSORIES_FALLBACK.heading, items: stored.items }
    }
    return ATTIRE_ACCESSORIES_FALLBACK
  } catch {
    return ATTIRE_ACCESSORIES_FALLBACK
  }
}
