import { draftMode } from 'next/headers'
import { createSupabaseServerClient } from '@/lib/supabase'

export type WebsitesDesignTreatment =
  | 'floral-cream'
  | 'botanical-sage'
  | 'modern-blush'
  | 'classic-serif'
  | 'coastal-blue'
  | 'minimal-cream'
  | 'twilight-navy'
  | 'rose-garden'

export type WebsitesDesignItem = {
  id: string
  name: string
  tags: string[]
  treatment: WebsitesDesignTreatment
  photo: string
}

export type WebsitesDesignsContent = {
  heading: string
  tabs: string[]
  designs: WebsitesDesignItem[]
}

export const WEBSITES_DESIGNS_FALLBACK: WebsitesDesignsContent = {
  heading: 'Pick your wedding website design',
  tabs: ['Most Popular', 'Floral', 'Botanical', 'Modern', 'Classic', 'Coastal'],
  designs: [
    { id: 'd1', name: 'Bagamoyo Bloom', tags: ['Most Popular', 'Floral'], treatment: 'floral-cream', photo: '/assets/images/cutesy_couple.jpg' },
    { id: 'd2', name: 'Mikocheni Garden', tags: ['Most Popular', 'Botanical'], treatment: 'botanical-sage', photo: '/assets/images/coupleswithpiano.jpg' },
    { id: 'd3', name: 'Mwanza Modern', tags: ['Most Popular', 'Modern'], treatment: 'modern-blush', photo: '/assets/images/authentic_couple.jpg' },
    { id: 'd4', name: 'Stone Town Classic', tags: ['Most Popular', 'Classic'], treatment: 'classic-serif', photo: '/assets/images/beautiful_bride.jpg' },
    { id: 'd5', name: 'Zanzibar Shore', tags: ['Most Popular', 'Coastal'], treatment: 'coastal-blue', photo: '/assets/images/bride_umbrella.jpg' },
    { id: 'd6', name: 'Arusha Minimal', tags: ['Most Popular', 'Modern'], treatment: 'minimal-cream', photo: '/assets/images/couples_together.jpg' },
    { id: 'd7', name: 'Selous Twilight', tags: ['Classic'], treatment: 'twilight-navy', photo: '/assets/images/churchcouples.jpg' },
    { id: 'd8', name: 'Rose Garden', tags: ['Floral'], treatment: 'rose-garden', photo: '/assets/images/beautyinbride.jpg' },
  ],
}

export async function loadWebsitesDesignsContent(): Promise<WebsitesDesignsContent> {
  if (!process.env.NEXT_PUBLIC_SUPABASE_URL || !process.env.SUPABASE_SERVICE_ROLE_KEY) {
    return WEBSITES_DESIGNS_FALLBACK
  }
  try {
    const { isEnabled: isDraft } = await draftMode()
    const supabase = createSupabaseServerClient()
    const { data } = await supabase
      .from('website_page_sections')
      .select('content, draft_content')
      .eq('page_key', 'opus-pass-websites')
      .eq('section_key', 'designs')
      .maybeSingle()
    const stored = (isDraft ? data?.draft_content ?? data?.content : data?.content) as
      | Partial<WebsitesDesignsContent>
      | undefined
    if (stored) {
      return {
        heading: stored.heading ?? WEBSITES_DESIGNS_FALLBACK.heading,
        tabs:
          stored.tabs && Array.isArray(stored.tabs) && stored.tabs.length > 0
            ? stored.tabs
            : WEBSITES_DESIGNS_FALLBACK.tabs,
        designs:
          stored.designs && Array.isArray(stored.designs) && stored.designs.length > 0
            ? stored.designs
            : WEBSITES_DESIGNS_FALLBACK.designs,
      }
    }
    return WEBSITES_DESIGNS_FALLBACK
  } catch (err) {
    console.error('[opus-pass cms] websites-designs load failed', err)
    return WEBSITES_DESIGNS_FALLBACK
  }
}
