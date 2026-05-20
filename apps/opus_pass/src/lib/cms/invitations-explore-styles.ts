import { draftMode } from 'next/headers'
import { createSupabaseServerClient } from '@/lib/supabase'

export type InvitationsExploreStyleLink = {
  id: string
  label: string
  href: string
}

export type InvitationsExploreStyleColumn = {
  id: string
  heading: string
  items: InvitationsExploreStyleLink[]
}

export type InvitationsExploreStylesContent = {
  heading: string
  columns: InvitationsExploreStyleColumn[]
}

export const INVITATIONS_EXPLORE_STYLES_FALLBACK: InvitationsExploreStylesContent = {
  heading: 'Explore other styles',
  columns: [
    {
      id: 'col-style', heading: 'By style',
      items: [
        { id: 'l1', label: 'Modern', href: '/invitations/catalog' },
        { id: 'l2', label: 'Classic', href: '/invitations/catalog' },
        { id: 'l3', label: 'Rustic', href: '/invitations/catalog' },
        { id: 'l4', label: 'Elegant', href: '/invitations/catalog' },
        { id: 'l5', label: 'Heritage Karibu', href: '/invitations/catalog' },
        { id: 'l6', label: 'Photo-led', href: '/invitations/catalog' },
      ],
    },
    {
      id: 'col-colour', heading: 'By colour',
      items: [
        { id: 'c1', label: 'Sage green', href: '/invitations/catalog' },
        { id: 'c2', label: 'Navy & gold', href: '/invitations/catalog' },
        { id: 'c3', label: 'Blush pink', href: '/invitations/catalog' },
        { id: 'c4', label: 'Burgundy', href: '/invitations/catalog' },
        { id: 'c5', label: 'Cream & black', href: '/invitations/catalog' },
        { id: 'c6', label: 'Coral', href: '/invitations/catalog' },
      ],
    },
    {
      id: 'col-moment', heading: 'By moment',
      items: [
        { id: 'm1', label: 'Save the date', href: '/invitations/catalog' },
        { id: 'm2', label: 'Invitations', href: '/invitations/catalog' },
        { id: 'm3', label: 'RSVP cards', href: '/invitations/catalog' },
        { id: 'm4', label: 'Welcome signs', href: '/invitations/catalog' },
        { id: 'm5', label: 'Programmes', href: '/invitations/catalog' },
        { id: 'm6', label: 'Thank yous', href: '/invitations/catalog' },
      ],
    },
    {
      id: 'col-special', heading: 'For special days',
      items: [
        { id: 'd1', label: 'Engagement party', href: '/invitations/catalog' },
        { id: 'd2', label: 'Send-off (Kitchen Party)', href: '/invitations/catalog' },
        { id: 'd3', label: 'Hen do', href: '/invitations/catalog' },
        { id: 'd4', label: 'Rehearsal dinner', href: '/invitations/catalog' },
        { id: 'd5', label: 'Reception', href: '/invitations/catalog' },
      ],
    },
  ],
}

export async function loadInvitationsExploreStylesContent(): Promise<InvitationsExploreStylesContent> {
  if (!process.env.NEXT_PUBLIC_SUPABASE_URL || !process.env.SUPABASE_SERVICE_ROLE_KEY) {
    return INVITATIONS_EXPLORE_STYLES_FALLBACK
  }
  try {
    const { isEnabled: isDraft } = await draftMode()
    const supabase = createSupabaseServerClient()
    const { data } = await supabase
      .from('website_page_sections')
      .select('content, draft_content')
      .eq('page_key', 'opus-pass-invitations')
      .eq('section_key', 'explore-styles')
      .maybeSingle()
    const stored = (isDraft ? data?.draft_content ?? data?.content : data?.content) as
      | Partial<InvitationsExploreStylesContent>
      | undefined
    if (stored) {
      return {
        heading: stored.heading ?? INVITATIONS_EXPLORE_STYLES_FALLBACK.heading,
        columns:
          stored.columns && Array.isArray(stored.columns) && stored.columns.length > 0
            ? stored.columns
            : INVITATIONS_EXPLORE_STYLES_FALLBACK.columns,
      }
    }
    return INVITATIONS_EXPLORE_STYLES_FALLBACK
  } catch (err) {
    console.error('[opus-pass cms] invitations-explore-styles load failed', err)
    return INVITATIONS_EXPLORE_STYLES_FALLBACK
  }
}
