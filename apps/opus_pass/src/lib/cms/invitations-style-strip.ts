import { draftMode } from 'next/headers'
import { createSupabaseServerClient } from '@/lib/supabase'

export type InvitationsStyleStripItem = {
  id: string
  label: string
  img: string
  alt: string
  href?: string
}

export type InvitationsStyleStripContent = {
  items: InvitationsStyleStripItem[]
}

export const INVITATIONS_STYLE_STRIP_FALLBACK: InvitationsStyleStripContent = {
  items: [
    { id: 's1', label: 'New Collections', img: '/assets/images/cutesy_couple.jpg', alt: 'New collection designs' },
    { id: 's2', label: 'Florals', img: '/assets/images/flowers_pinky.jpg', alt: 'Floral invitation designs' },
    { id: 's3', label: 'Plants', img: '/assets/images/bride_umbrella.jpg', alt: 'Botanical plant designs' },
    { id: 's4', label: 'Watercolor & Botanicals', img: '/assets/images/bridewithumbrella.jpg', alt: 'Watercolor and botanical designs' },
    { id: 's5', label: 'Karibu Crest', img: '/assets/images/churchcouples.jpg', alt: 'Karibu crest cultural designs' },
    { id: 's6', label: 'Photos', img: '/assets/images/couples_together.jpg', alt: 'Photo-led invitation designs' },
    { id: 's7', label: 'Vintage', img: '/assets/images/coupleswithpiano.jpg', alt: 'Vintage style designs' },
    { id: 's8', label: 'Personalise', img: '/assets/images/beautiful_bride.jpg', alt: 'Personalised designs' },
  ],
}

export async function loadInvitationsStyleStripContent(): Promise<InvitationsStyleStripContent> {
  if (!process.env.NEXT_PUBLIC_SUPABASE_URL || !process.env.SUPABASE_SERVICE_ROLE_KEY) {
    return INVITATIONS_STYLE_STRIP_FALLBACK
  }
  try {
    const { isEnabled: isDraft } = await draftMode()
    const supabase = createSupabaseServerClient()
    const { data } = await supabase
      .from('website_page_sections')
      .select('content, draft_content')
      .eq('page_key', 'opus-pass-invitations')
      .eq('section_key', 'style-strip')
      .maybeSingle()
    const stored = (isDraft ? data?.draft_content ?? data?.content : data?.content) as
      | Partial<InvitationsStyleStripContent>
      | undefined
    if (stored?.items && Array.isArray(stored.items) && stored.items.length > 0) {
      return { items: stored.items }
    }
    return INVITATIONS_STYLE_STRIP_FALLBACK
  } catch (err) {
    console.error('[opus-pass cms] invitations-style-strip load failed', err)
    return INVITATIONS_STYLE_STRIP_FALLBACK
  }
}
