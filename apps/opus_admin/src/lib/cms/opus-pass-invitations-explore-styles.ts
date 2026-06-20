import type { MaybeLocalized } from '@/lib/cms/localized'

export type OpusPassExploreStyleLink = {
  id: string
  label: MaybeLocalized
  href: string
}

export type OpusPassExploreStyleColumn = {
  id: string
  heading: MaybeLocalized
  items: OpusPassExploreStyleLink[]
}

export type OpusPassInvitationsExploreStylesContent = {
  heading: MaybeLocalized
  columns: OpusPassExploreStyleColumn[]
}

export type OpusPassInvitationsExploreStylesRow = {
  id: string
  page_key: string
  section_key: string
  content: OpusPassInvitationsExploreStylesContent
  draft_content: OpusPassInvitationsExploreStylesContent | null
  is_published: boolean
  updated_at: string
}

export const OPUS_PASS_INVITATIONS_EXPLORE_STYLES_FALLBACK: OpusPassInvitationsExploreStylesContent = {
  heading: 'Explore other styles',
  columns: [
    {
      id: 'col-style',
      heading: 'By style',
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
      id: 'col-colour',
      heading: 'By colour',
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
      id: 'col-moment',
      heading: 'By moment',
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
      id: 'col-special',
      heading: 'For special days',
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
