import { draftMode } from 'next/headers'
import { createSupabaseServerClient } from '@/lib/supabase'

export type WebsitesHeroContent = {
  headline_line_1: string
  headline_line_2: string
  description: string
  primary_cta_label: string
  primary_cta_href: string
  secondary_cta_label: string
  secondary_cta_href: string
  background_color: string
  /** Optional uploaded image. When set, replaces the built-in laptop + phone mockup on the right. */
  right_image_url: string
  right_image_alt: string
}

export const WEBSITES_HERO_FALLBACK: WebsitesHeroContent = {
  headline_line_1: 'Your wedding website,',
  headline_line_2: 'ready in minutes.',
  description:
    "Build a beautiful wedding website to share details, collect RSVPs and link your registry — all in one place. Free with every OpusPass, bilingual in Swahili and English.",
  primary_cta_label: 'Start your website',
  primary_cta_href: '/sign-up',
  secondary_cta_label: 'Explore designs',
  secondary_cta_href: '#designs',
  background_color: '#E1ECDB',
  right_image_url: '',
  right_image_alt: '',
}

export async function loadWebsitesHeroContent(): Promise<WebsitesHeroContent> {
  if (!process.env.NEXT_PUBLIC_SUPABASE_URL || !process.env.SUPABASE_SERVICE_ROLE_KEY) {
    return WEBSITES_HERO_FALLBACK
  }
  try {
    const { isEnabled: isDraft } = await draftMode()
    const supabase = createSupabaseServerClient()
    const { data } = await supabase
      .from('website_page_sections')
      .select('content, draft_content')
      .eq('page_key', 'opus-pass-websites')
      .eq('section_key', 'hero')
      .maybeSingle()
    const stored = (isDraft ? data?.draft_content ?? data?.content : data?.content) as
      | Partial<WebsitesHeroContent>
      | undefined
    if (stored) {
      return { ...WEBSITES_HERO_FALLBACK, ...stored }
    }
    return WEBSITES_HERO_FALLBACK
  } catch (err) {
    console.error('[opus-pass cms] websites-hero load failed', err)
    return WEBSITES_HERO_FALLBACK
  }
}
