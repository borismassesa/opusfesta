export type TrustIconKey =
  | 'users'
  | 'landmark'
  | 'headset'
  | 'badge-check'
  | 'shield-check'
  | 'award'
  | 'heart-handshake'
  | 'star'
  | 'thumbs-up'
  | 'sparkles'
  | 'lock'
  | 'globe'

export type TrustItem = {
  id: string
  icon: TrustIconKey
  title: string
  description: string
}

export type TrustContent = {
  items: TrustItem[]
}

export type TrustRow = {
  id: string
  page_key: string
  section_key: string
  content: TrustContent
  draft_content: TrustContent | null
  is_published: boolean
  updated_at: string
}

export const TRUST_FALLBACK: TrustContent = {
  items: [
    {
      id: 'trusted',
      icon: 'users',
      title: 'Trusted by millions planning weddings',
      description: 'We help plan over 2 million weddings worldwide every year',
    },
    {
      id: 'verified',
      icon: 'landmark',
      title: 'Verified Vendors',
      description:
        'OpusFesta features only verified, highly-reviewed wedding professionals in your area',
    },
    {
      id: 'support',
      icon: 'headset',
      title: '24/7 expert support',
      description: 'Get help from our wedding concierges anytime over email, phone and chat',
    },
  ],
}
