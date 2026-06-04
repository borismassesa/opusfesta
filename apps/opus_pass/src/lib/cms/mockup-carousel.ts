import 'server-only'
import { createSupabaseServerClient } from '@/lib/supabase'
import { DEFAULT_CARD_PLACEMENT, type CardPlacement } from '@/lib/cms/mockup-placement'

export type { CardPlacement } from '@/lib/cms/mockup-placement'

export type MockupCarouselData = {
  images: Record<string, string>
  scenes: { id: string; label: string }[]
  placements: Record<string, CardPlacement>
}

const DEFAULT_LABELS: Record<string, string> = {
  'flat-lay':    'Flat lay',
  'dark-studio': 'Dark studio',
  'paper-stack': 'Paper stack',
  'envelope':    'Envelope',
  'phone':       'Phone',
}

export async function loadMockupCarouselImages(): Promise<MockupCarouselData> {
  try {
    const supabase = createSupabaseServerClient()
    const { data, error } = await supabase
      .from('website_cms_mockup_carousel')
      .select('scene, label, url, card_x, card_y, card_width, card_rotate, card_hidden')
      .order('sort_order', { ascending: true })
    if (error) throw error
    const rows = (data ?? []) as {
      scene: string
      label: string | null
      url: string
      card_x: number | null
      card_y: number | null
      card_width: number | null
      card_rotate: number | null
      card_hidden: boolean | null
    }[]
    return {
      images: Object.fromEntries(rows.filter((r) => r.url).map((r) => [r.scene, r.url])),
      scenes: rows.map((r) => ({ id: r.scene, label: r.label ?? DEFAULT_LABELS[r.scene] ?? r.scene })),
      placements: Object.fromEntries(
        rows.map((r) => [
          r.scene,
          {
            x: r.card_x ?? DEFAULT_CARD_PLACEMENT.x,
            y: r.card_y ?? DEFAULT_CARD_PLACEMENT.y,
            width: r.card_width ?? DEFAULT_CARD_PLACEMENT.width,
            rotate: r.card_rotate ?? DEFAULT_CARD_PLACEMENT.rotate,
            hidden: r.card_hidden ?? DEFAULT_CARD_PLACEMENT.hidden,
          } satisfies CardPlacement,
        ])
      ),
    }
  } catch {
    return { images: {}, scenes: [], placements: {} }
  }
}
