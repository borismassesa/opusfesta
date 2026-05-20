import { draftMode } from 'next/headers'
import { createSupabaseServerClient } from '@/lib/supabase'

export type HomepageFeatureBlock = {
  id: string
  reverse: boolean
  media_main: string
  media_secondary: string
  media_overlay: string
  overlay_eyebrow: string
  overlay_caption_line_1: string
  overlay_caption_line_2: string
  headline_line_1: string
  headline_line_2: string
  body: string
  pills: string[]
  primary_cta_label: string
  primary_cta_href: string
  secondary_cta_label: string
  secondary_cta_href: string
}

export type HomepageFeaturesContent = {
  header_title: string
  header_description: string
  blocks: HomepageFeatureBlock[]
}

export const HOMEPAGE_FEATURES_FALLBACK: HomepageFeaturesContent = {
  header_title: 'Built for every wedding moment',
  header_description:
    'Three tools that turn save-the-dates to the final seating chart, OpusPass keeps every guest, message, and detail in sync.',
  blocks: [
    {
      id: 'invitations', reverse: false,
      media_main: '/assets/images/cutesy_couple.jpg',
      media_secondary: '/assets/images/flowers_pinky.jpg',
      media_overlay: '/assets/images/authentic_couple.jpg',
      overlay_eyebrow: 'Invites', overlay_caption_line_1: 'Tap, RSVP,', overlay_caption_line_2: 'done.',
      headline_line_1: 'Designer-worthy', headline_line_2: 'digital invitations',
      body: 'For save-the-dates, weddings, kitchen parties and send-offs. Delivered by WhatsApp or SMS, with RSVP built in.',
      pills: ['Save the Dates', 'Wedding Invites', 'Kitchen Party', 'Send-Off'],
      primary_cta_label: 'Browse designs', primary_cta_href: '/invitations',
      secondary_cta_label: 'See pricing', secondary_cta_href: '/invitations/catalog',
    },
    {
      id: 'guests', reverse: true,
      media_main: '/assets/images/mauzo_crew.jpg',
      media_secondary: '/assets/images/churchcouples.jpg',
      media_overlay: '/assets/images/couples_together.jpg',
      overlay_eyebrow: 'Guests', overlay_caption_line_1: 'Every guest,', overlay_caption_line_2: 'every RSVP.',
      headline_line_1: 'Your guest list', headline_line_2: 'and live RSVPs',
      body: 'Manage your guest list, send invites by WhatsApp or SMS, and watch responses come in live. Send reminders, finalise seating, no spreadsheets needed.',
      pills: ['Guest list', 'Live RSVPs', 'Auto reminders', 'Seating chart'],
      primary_cta_label: 'Manage guests', primary_cta_href: '/guests',
      secondary_cta_label: 'How it works', secondary_cta_href: '/guests',
    },
    {
      id: 'website', reverse: false,
      media_main: '/assets/images/coupleswithpiano.jpg',
      media_secondary: '/assets/images/beautiful_bride.jpg',
      media_overlay: '/assets/images/bride_umbrella.jpg',
      overlay_eyebrow: 'Website', overlay_caption_line_1: 'One link.', overlay_caption_line_2: 'Every detail.',
      headline_line_1: 'A wedding site', headline_line_2: 'in minutes',
      body: 'Share your story, venue, travel info and live updates — your guests just tap a single link from their phones. Change anything once and the world sees it instantly.',
      pills: ['Custom link', 'Photo gallery', 'Travel info', 'Live updates'],
      primary_cta_label: 'Build your website', primary_cta_href: '/websites',
      secondary_cta_label: 'See examples', secondary_cta_href: '/websites',
    },
  ],
}

export async function loadHomepageFeaturesContent(): Promise<HomepageFeaturesContent> {
  if (!process.env.NEXT_PUBLIC_SUPABASE_URL || !process.env.SUPABASE_SERVICE_ROLE_KEY) {
    return HOMEPAGE_FEATURES_FALLBACK
  }
  try {
    const { isEnabled: isDraft } = await draftMode()
    const supabase = createSupabaseServerClient()
    const { data } = await supabase
      .from('website_page_sections')
      .select('content, draft_content')
      .eq('page_key', 'opus-pass-homepage')
      .eq('section_key', 'features')
      .maybeSingle()
    const stored = (isDraft ? data?.draft_content ?? data?.content : data?.content) as
      | Partial<HomepageFeaturesContent>
      | undefined
    if (stored) {
      return {
        header_title: stored.header_title ?? HOMEPAGE_FEATURES_FALLBACK.header_title,
        header_description: stored.header_description ?? HOMEPAGE_FEATURES_FALLBACK.header_description,
        blocks:
          stored.blocks && Array.isArray(stored.blocks) && stored.blocks.length > 0
            ? stored.blocks
            : HOMEPAGE_FEATURES_FALLBACK.blocks,
      }
    }
    return HOMEPAGE_FEATURES_FALLBACK
  } catch (err) {
    console.error('[opus-pass cms] homepage-features load failed', err)
    return HOMEPAGE_FEATURES_FALLBACK
  }
}
