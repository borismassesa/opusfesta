export type OpusPassInvitationsStyleStripItem = {
  id: string
  label: string
  img: string
  alt: string
  /** Optional link — leave empty to render as a non-link visual chip. */
  href?: string
}

export type OpusPassInvitationsStyleStripContent = {
  items: OpusPassInvitationsStyleStripItem[]
}

export type OpusPassInvitationsStyleStripRow = {
  id: string
  page_key: string
  section_key: string
  content: OpusPassInvitationsStyleStripContent
  draft_content: OpusPassInvitationsStyleStripContent | null
  is_published: boolean
  updated_at: string
}

export const OPUS_PASS_INVITATIONS_STYLE_STRIP_FALLBACK: OpusPassInvitationsStyleStripContent = {
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
