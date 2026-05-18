import { createSupabaseServerClient } from '@/lib/supabase'

export type AttirePickItem = {
  id: string
  img: string
  has_video: boolean
  has_heart: boolean
  price: string
}

export type AttireEditorsPicksContent = {
  eyebrow: string
  heading: string
  cta_label: string
  footer_text: string
  row1: AttirePickItem[]
  row2: AttirePickItem[]
}

export const ATTIRE_EDITORS_PICKS_FALLBACK: AttireEditorsPicksContent = {
  eyebrow: "Editors' Picks",
  heading: 'Bridal & Accessories Favourites',
  cta_label: 'Shop these unique finds',
  footer_text: 'Your one-stop shop for wedding attire, rings, and accessories',
  row1: [
    { id: '1', img: 'https://images.unsplash.com/photo-1595777457583-95e059d581b8?auto=format&fit=crop&w=800&q=80', has_video: true, has_heart: false, price: '' },
    { id: '2', img: 'https://images.unsplash.com/photo-1511285560929-80b456fea0bc?auto=format&fit=crop&w=800&q=80', has_video: false, has_heart: false, price: '' },
    { id: '3', img: 'https://images.unsplash.com/photo-1593030761757-71fae45fa0e7?auto=format&fit=crop&w=800&q=80', has_video: false, has_heart: false, price: '' },
  ],
  row2: [
    { id: '4', img: 'https://images.unsplash.com/photo-1543163521-1bf539c55dd2?auto=format&fit=crop&w=800&q=80', has_video: true, has_heart: false, price: '' },
    { id: '5', img: 'https://images.unsplash.com/photo-1515934751635-c81c6bc9a2d8?auto=format&fit=crop&w=800&q=80', has_video: false, has_heart: true, price: 'TZS 2,298,000' },
    { id: '6', img: 'https://images.unsplash.com/photo-1606800052052-a08af7148866?auto=format&fit=crop&w=800&q=80', has_video: true, has_heart: false, price: '' },
  ],
}

export async function loadAttireEditorsPicksContent(): Promise<AttireEditorsPicksContent> {
  if (!process.env.NEXT_PUBLIC_SUPABASE_URL || !process.env.SUPABASE_SERVICE_ROLE_KEY) {
    return ATTIRE_EDITORS_PICKS_FALLBACK
  }
  try {
    const supabase = createSupabaseServerClient()
    const { data } = await supabase
      .from('website_page_sections')
      .select('content')
      .eq('page_key', 'attire-and-rings')
      .eq('section_key', 'editors-picks')
      .maybeSingle()
    const stored = data?.content as Partial<AttireEditorsPicksContent> | undefined
    if (stored) {
      return {
        eyebrow: stored.eyebrow ?? ATTIRE_EDITORS_PICKS_FALLBACK.eyebrow,
        heading: stored.heading ?? ATTIRE_EDITORS_PICKS_FALLBACK.heading,
        cta_label: stored.cta_label ?? ATTIRE_EDITORS_PICKS_FALLBACK.cta_label,
        footer_text: stored.footer_text ?? ATTIRE_EDITORS_PICKS_FALLBACK.footer_text,
        row1: stored.row1?.length ? stored.row1 : ATTIRE_EDITORS_PICKS_FALLBACK.row1,
        row2: stored.row2?.length ? stored.row2 : ATTIRE_EDITORS_PICKS_FALLBACK.row2,
      }
    }
    return ATTIRE_EDITORS_PICKS_FALLBACK
  } catch {
    return ATTIRE_EDITORS_PICKS_FALLBACK
  }
}
