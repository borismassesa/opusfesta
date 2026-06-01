export type OpusPassHomepageShowcaseImage = {
  src: string
  alt: string
}

export type OpusPassHomepageShowcaseCaption = {
  title: string
  by: string
  brand: string
}

export type OpusPassHomepageShowcaseContent = {
  caption: OpusPassHomepageShowcaseCaption
  images: OpusPassHomepageShowcaseImage[]
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
}
