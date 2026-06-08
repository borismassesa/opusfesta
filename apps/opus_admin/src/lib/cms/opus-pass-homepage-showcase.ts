export type OpusPassHomepageShowcaseImage = {
  src: string
  alt: string
}

export type OpusPassHomepageShowcaseCaption = {
  title: string
  by: string
  brand: string
  badge: string
}

export type OpusPassHomepageShowcasePillKind = 'visit' | 'stat' | 'toggle'

export type OpusPassHomepageShowcasePill = {
  id: string
  kind: OpusPassHomepageShowcasePillKind
  slot: number
  color: string
  side: 'left' | 'right'
  label: string
  sublabel: string
}

export type OpusPassHomepageShowcaseContent = {
  caption: OpusPassHomepageShowcaseCaption
  images: OpusPassHomepageShowcaseImage[]
  pills: OpusPassHomepageShowcasePill[]
  accent_color: string
}

export type OpusPassHomepageShowcaseRow = {
  id: string
  page_key: string
  section_key: string
  content: OpusPassHomepageShowcaseContent
  draft_content: OpusPassHomepageShowcaseContent | null
  is_published: boolean
  updated_at: string
}

export const OPUS_PASS_HOMEPAGE_SHOWCASE_FALLBACK: OpusPassHomepageShowcaseContent = {
  caption: {
    title: 'Your big day, beautifully shared',
    by: 'Created with',
    brand: 'OpusPass',
    badge: 'O.',
  },
  images: [
    { src: '/assets/images/bride_umbrella.jpg', alt: 'Bride with umbrella' },
    { src: '/assets/images/churchcouples.jpg', alt: 'Couple at the ceremony' },
    { src: '/assets/images/hand_rings.jpg', alt: 'Hands with wedding rings' },
    { src: '/assets/images/cutesy_couple.jpg', alt: 'A happy couple' },
    { src: '/assets/images/coupleswithpiano.jpg', alt: 'Couple at the piano' },
    { src: '/assets/images/brideincar.jpg', alt: 'Bride in the car' },
    { src: '/assets/images/flowers_pinky.jpg', alt: 'Wedding flowers' },
  ],
  pills: [
    { id: 'visit-1', kind: 'visit', slot: 2, color: '#FFFFFF', side: 'left', label: 'Visit', sublabel: '' },
    { id: 'stat-1', kind: 'stat', slot: 1, color: '#9FE870', side: 'left', label: 'Performance', sublabel: 'Sales' },
    { id: 'visit-2', kind: 'visit', slot: 5, color: '#FFFFFF', side: 'right', label: 'Visit', sublabel: '' },
    { id: 'toggle-1', kind: 'toggle', slot: 6, color: '#9FE870', side: 'left', label: 'Live RSVPs', sublabel: '' },
  ],
  accent_color: '#9FE870',
}
