import { draftMode } from 'next/headers'
import { createSupabaseServerClient } from '@/lib/supabase'

export type GuestsSpreadIconKey =
  | 'file-down'
  | 'printer'
  | 'share-2'
  | 'clipboard-check'
  | 'mail'
  | 'message-circle'
  | 'send'
  | 'calendar-check'
  | 'users'
  | 'heart'

export type GuestsSpreadItem = {
  id: string
  icon: GuestsSpreadIconKey
  title: string
  description: string
}

export type GuestsSpreadContent = {
  heading: string
  description: string
  items: GuestsSpreadItem[]
}

export const GUESTS_SPREAD_FALLBACK: GuestsSpreadContent = {
  heading: 'Endless ways to spread the joy',
  description: 'Design it once, share it everywhere!',
  items: [
    {
      id: 'download',
      icon: 'file-down',
      title: 'Download',
      description: 'Get a digital copy of your invitation by downloading it to your device.',
    },
    {
      id: 'print',
      icon: 'printer',
      title: 'Print',
      description: 'Download a high-quality PDF and print at home, or let us do the printing!',
    },
    {
      id: 'share',
      icon: 'share-2',
      title: 'Share',
      description: 'Spread the word on social media, by text message, or email to friends and family.',
    },
    {
      id: 'manage',
      icon: 'clipboard-check',
      title: 'Manage',
      description: 'Create an online event page to collect RSVPs and manage all the little details!',
    },
  ],
}

export async function loadGuestsSpreadContent(): Promise<GuestsSpreadContent> {
  if (!process.env.NEXT_PUBLIC_SUPABASE_URL || !process.env.SUPABASE_SERVICE_ROLE_KEY) {
    return GUESTS_SPREAD_FALLBACK
  }
  try {
    const { isEnabled: isDraft } = await draftMode()
    const supabase = createSupabaseServerClient()
    const { data } = await supabase
      .from('website_page_sections')
      .select('content, draft_content')
      .eq('page_key', 'opus-pass-guests')
      .eq('section_key', 'spread-the-joy')
      .maybeSingle()
    const stored = (isDraft ? data?.draft_content ?? data?.content : data?.content) as
      | Partial<GuestsSpreadContent>
      | undefined
    if (stored) {
      return {
        heading: stored.heading ?? GUESTS_SPREAD_FALLBACK.heading,
        description: stored.description ?? GUESTS_SPREAD_FALLBACK.description,
        items:
          stored.items && Array.isArray(stored.items) && stored.items.length > 0
            ? stored.items
            : GUESTS_SPREAD_FALLBACK.items,
      }
    }
    return GUESTS_SPREAD_FALLBACK
  } catch (err) {
    console.error('[opus-pass cms] guests-spread-the-joy load failed', err)
    return GUESTS_SPREAD_FALLBACK
  }
}
