import 'server-only'
import { createSupabaseServerClient } from '@/lib/supabase'

export type MockupCarouselData = {
  images: Record<string, string>
  scenes: { id: string; label: string }[]
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
      .select('scene, label, url')
      .order('sort_order', { ascending: true })
    if (error) throw error
    const rows = (data ?? []) as { scene: string; label: string | null; url: string }[]
    return {
      images: Object.fromEntries(rows.filter((r) => r.url).map((r) => [r.scene, r.url])),
      scenes: rows.map((r) => ({ id: r.scene, label: r.label ?? DEFAULT_LABELS[r.scene] ?? r.scene })),
    }
  } catch {
    return { images: {}, scenes: [] }
  }
}
