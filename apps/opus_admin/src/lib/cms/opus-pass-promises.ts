import type { MaybeLocalized } from '@/lib/cms/localized'

export type PromiseIconKey = 'sparkles' | 'palette' | 'wand2' | 'message-circle' | 'heart' | 'shield-check' | 'star' | 'gem'

export type OpusPassPromiseItem = {
  id: string
  icon: PromiseIconKey
  // Translatable copy.
  title: MaybeLocalized
  description: MaybeLocalized
}

export type OpusPassPromisesContent = {
  items: OpusPassPromiseItem[]
}

export type OpusPassPromisesRow = {
  id: string
  page_key: string
  section_key: string
  content: OpusPassPromisesContent
  draft_content: OpusPassPromisesContent | null
  is_published: boolean
  updated_at: string
}

export const PROMISE_ICON_KEYS: PromiseIconKey[] = [
  'sparkles',
  'palette',
  'wand2',
  'message-circle',
  'heart',
  'shield-check',
  'star',
  'gem',
]

export const OPUS_PASS_PROMISES_FALLBACK: OpusPassPromisesContent = {
  items: [
    {
      id: 'premium-quality',
      icon: 'sparkles',
      title: 'Premium quality',
      description: 'The finest and most premium materials & printing techniques.',
    },
    {
      id: 'designed-by-artists',
      icon: 'palette',
      title: 'Designed by artists',
      description: 'Every purchase supports our independent artist community.',
    },
    {
      id: 'easy-customization',
      icon: 'wand2',
      title: 'Easy customization',
      description: 'Make it personal by tailoring card shape, colors, fonts, paper type, & more.',
    },
    {
      id: 'free-support',
      icon: 'message-circle',
      title: 'Free support',
      description: 'Bring your vision to life with the helping hand of a wedding concierge.',
    },
  ],
}
