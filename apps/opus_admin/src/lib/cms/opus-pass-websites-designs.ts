export type OpusPassWebsitesDesignTreatment =
  | 'floral-cream'
  | 'botanical-sage'
  | 'modern-blush'
  | 'classic-serif'
  | 'coastal-blue'
  | 'minimal-cream'
  | 'twilight-navy'
  | 'rose-garden'

export const OPUS_PASS_WEBSITES_DESIGN_TREATMENTS: OpusPassWebsitesDesignTreatment[] = [
  'floral-cream',
  'botanical-sage',
  'modern-blush',
  'classic-serif',
  'coastal-blue',
  'minimal-cream',
  'twilight-navy',
  'rose-garden',
]

export type OpusPassWebsitesDesignItem = {
  id: string
  name: string
  tags: string[]
  treatment: OpusPassWebsitesDesignTreatment
  photo: string
}

export type OpusPassWebsitesDesignsContent = {
  heading: string
  tabs: string[]
  designs: OpusPassWebsitesDesignItem[]
}

export type OpusPassWebsitesDesignsRow = {
  id: string
  page_key: string
  section_key: string
  content: OpusPassWebsitesDesignsContent
  draft_content: OpusPassWebsitesDesignsContent | null
  is_published: boolean
  updated_at: string
}

export const OPUS_PASS_WEBSITES_DESIGNS_FALLBACK: OpusPassWebsitesDesignsContent = {
  heading: 'Pick your wedding website design',
  tabs: ['Most Popular', 'Floral', 'Botanical', 'Modern', 'Classic', 'Coastal'],
  designs: [
    { id: 'd1', name: 'Bagamoyo Bloom', tags: ['Most Popular', 'Floral'], treatment: 'floral-cream', photo: '/assets/images/cutesy_couple.jpg' },
    { id: 'd2', name: 'Mikocheni Garden', tags: ['Most Popular', 'Botanical'], treatment: 'botanical-sage', photo: '/assets/images/coupleswithpiano.jpg' },
    { id: 'd3', name: 'Mwanza Modern', tags: ['Most Popular', 'Modern'], treatment: 'modern-blush', photo: '/assets/images/authentic_couple.jpg' },
    { id: 'd4', name: 'Stone Town Classic', tags: ['Most Popular', 'Classic'], treatment: 'classic-serif', photo: '/assets/images/beautiful_bride.jpg' },
    { id: 'd5', name: 'Zanzibar Shore', tags: ['Most Popular', 'Coastal'], treatment: 'coastal-blue', photo: '/assets/images/bride_umbrella.jpg' },
    { id: 'd6', name: 'Arusha Minimal', tags: ['Most Popular', 'Modern'], treatment: 'minimal-cream', photo: '/assets/images/couples_together.jpg' },
    { id: 'd7', name: 'Selous Twilight', tags: ['Classic'], treatment: 'twilight-navy', photo: '/assets/images/churchcouples.jpg' },
    { id: 'd8', name: 'Rose Garden', tags: ['Floral'], treatment: 'rose-garden', photo: '/assets/images/beautyinbride.jpg' },
  ],
}
