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

export type OpusPassHomepageShowcasePills = {
  visit_label: string
  stat_title: string
  stat_label: string
  toggle_label: string
}

export type OpusPassHomepageShowcaseContent = {
  caption: OpusPassHomepageShowcaseCaption
  images: OpusPassHomepageShowcaseImage[]
  pills: OpusPassHomepageShowcasePills
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
  pills: {
    visit_label: 'Visit',
    stat_title: 'Performance',
    stat_label: 'Sales',
    toggle_label: 'Live RSVPs',
  },
  accent_color: '#9FE870',
}
