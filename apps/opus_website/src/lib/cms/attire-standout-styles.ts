import { createSupabaseServerClient } from '@/lib/supabase'

export type AttireStandoutItem = { id: string; name: string; discount: string; img: string }
export type AttireStandoutStylesContent = { heading: string; items: AttireStandoutItem[] }

export const ATTIRE_STANDOUT_STYLES_FALLBACK: AttireStandoutStylesContent = {
  heading: 'Save now on standout styles',
  items: [
    { id: '1', name: 'Diamond Rings', discount: 'up to 20% off', img: 'https://images.unsplash.com/photo-1511285560929-80b456fea0bc?auto=format&fit=crop&w=600&q=80' },
    { id: '2', name: 'Wedding Dresses', discount: 'up to 20% off', img: 'https://images.unsplash.com/photo-1595777457583-95e059d581b8?auto=format&fit=crop&w=600&q=80' },
    { id: '3', name: 'Groom Suits', discount: 'up to 20% off', img: 'https://images.unsplash.com/photo-1593030761757-71fae45fa0e7?auto=format&fit=crop&w=600&q=80' },
    { id: '4', name: 'Bridal Shoes', discount: 'up to 20% off', img: 'https://images.unsplash.com/photo-1543163521-1bf539c55dd2?auto=format&fit=crop&w=600&q=80' },
    { id: '5', name: 'Wedding Bands', discount: 'up to 20% off', img: 'https://images.unsplash.com/photo-1515934751635-c81c6bc9a2d8?auto=format&fit=crop&w=600&q=80' },
  ],
}

export async function loadAttireStandoutStylesContent(): Promise<AttireStandoutStylesContent> {
  if (!process.env.NEXT_PUBLIC_SUPABASE_URL || !process.env.SUPABASE_SERVICE_ROLE_KEY) {
    return ATTIRE_STANDOUT_STYLES_FALLBACK
  }
  try {
    const supabase = createSupabaseServerClient()
    const { data } = await supabase
      .from('website_page_sections')
      .select('content')
      .eq('page_key', 'attire-and-rings')
      .eq('section_key', 'standout-styles')
      .maybeSingle()
    const stored = data?.content as Partial<AttireStandoutStylesContent> | undefined
    if (stored?.items?.length) {
      return { heading: stored.heading ?? ATTIRE_STANDOUT_STYLES_FALLBACK.heading, items: stored.items }
    }
    return ATTIRE_STANDOUT_STYLES_FALLBACK
  } catch {
    return ATTIRE_STANDOUT_STYLES_FALLBACK
  }
}
