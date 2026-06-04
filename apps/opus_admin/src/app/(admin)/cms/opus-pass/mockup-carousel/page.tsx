import { createSupabaseAdminClient } from '@/lib/supabase'
import MockupCarouselEditor from './MockupCarouselEditor'
import type { MockupScene } from './actions'

export const dynamic = 'force-dynamic'

async function loadScenes(): Promise<MockupScene[]> {
  const supabase = createSupabaseAdminClient()
  const { data } = await supabase
    .from('website_cms_mockup_carousel')
    .select('scene, url, label, sort_order, card_x, card_y, card_width, card_rotate, card_hidden')
    .order('sort_order', { ascending: true })
  return (data ?? []) as MockupScene[]
}

export default async function MockupCarouselCmsPage() {
  const scenes = await loadScenes()
  return <MockupCarouselEditor initial={scenes} />
}
