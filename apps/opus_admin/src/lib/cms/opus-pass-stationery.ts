export type OpusPassStationeryVisual = 'palette' | 'website' | 'envelopes'

export type OpusPassStationeryCard = {
  id: string
  title: string
  description: string
  cta_label: string
  cta_href: string
  image: string
  visual: OpusPassStationeryVisual
}

export type OpusPassStationeryContent = {
  heading: string
  swatches: string[]
  cards: OpusPassStationeryCard[]
}

export type OpusPassStationeryRow = {
  id: string
  page_key: string
  section_key: string
  content: OpusPassStationeryContent
  draft_content: OpusPassStationeryContent | null
  is_published: boolean
  updated_at: string
}

export const STATIONERY_VISUALS: OpusPassStationeryVisual[] = ['palette', 'website', 'envelopes']

export const OPUS_PASS_STATIONERY_FALLBACK: OpusPassStationeryContent = {
  heading: 'Your wedding suite made easy, from design to delivery',
  swatches: ['#7b1d1d', '#1f2a59', '#f1e3d5', '#c98080', '#9bb6cc', '#c47a3a'],
  cards: [
    {
      id: 'design-assistance',
      title: 'Free Design Assistance',
      description:
        'Turn your design into something made for your wedding. From custom layouts to fonts and colours, our team is here to help.',
      cta_label: 'Start personalizing',
      cta_href: '/invitations/catalog',
      image: '/assets/images/cutesy_couple.jpg',
      visual: 'palette',
    },
    {
      id: 'matching-website',
      title: 'Free Matching Website',
      description:
        'Pair your invitation with a coordinated wedding website so your details, RSVPs and gallery live in one beautifully cohesive place.',
      cta_label: 'Find your match',
      cta_href: '/websites',
      image: '/assets/images/coupleswithpiano.jpg',
      visual: 'website',
    },
    {
      id: 'guest-messaging',
      title: 'Easy Guest Messaging',
      description:
        'Skip the handwriting hassle and let us send your invites by WhatsApp or SMS. Track delivery and RSVPs in real time.',
      cta_label: 'Get started',
      cta_href: '/guests',
      image: '/assets/images/churchcouples.jpg',
      visual: 'envelopes',
    },
  ],
}
