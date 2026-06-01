import { draftMode } from 'next/headers'
import { createSupabaseServerClient } from '@/lib/supabase'

// The manifesto is one typographic sentence with brand media interleaved at
// fixed points. The OpusFesta logo mark stays fixed in the component; the text
// segments, the inline "RSVP" pill label, and the three inline images are CMS.
export type HomepageManifestoContent = {
  segment_1: string
  pill_label: string
  segment_2: string
  invite_image_url: string
  segment_3: string
  guest_image_url: string
  segment_4: string
  place_image_url: string
  segment_5: string
}

export const HOMEPAGE_MANIFESTO_FALLBACK: HomepageManifestoContent = {
  segment_1: 'OpusPass brings your invites,',
  pill_label: 'RSVP',
  segment_2: 'guest list and wedding website into one beautifully simple place. Send a',
  invite_image_url: '/assets/invitation-svgs/classic-serif.svg',
  segment_3: 'design by WhatsApp or SMS, let guests',
  guest_image_url: '/assets/images/cutesy_couple.jpg',
  segment_4: 'tap to confirm — designed for couples in',
  place_image_url: '/assets/images/flowers_pinky.jpg',
  segment_5: 'Tanzania.',
}

export async function loadHomepageManifestoContent(): Promise<HomepageManifestoContent> {
  if (!process.env.NEXT_PUBLIC_SUPABASE_URL || !process.env.SUPABASE_SERVICE_ROLE_KEY) {
    return HOMEPAGE_MANIFESTO_FALLBACK
  }
  try {
    const { isEnabled: isDraft } = await draftMode()
    const supabase = createSupabaseServerClient()
    const { data } = await supabase
      .from('website_page_sections')
      .select('content, draft_content')
      .eq('page_key', 'opus-pass-homepage')
      .eq('section_key', 'manifesto')
      .maybeSingle()
    const stored = (isDraft ? data?.draft_content ?? data?.content : data?.content) as
      | Partial<HomepageManifestoContent>
      | undefined
    if (stored) {
      return { ...HOMEPAGE_MANIFESTO_FALLBACK, ...stored }
    }
    return HOMEPAGE_MANIFESTO_FALLBACK
  } catch (err) {
    console.error('[opus-pass cms] homepage-manifesto load failed', err)
    return HOMEPAGE_MANIFESTO_FALLBACK
  }
}
