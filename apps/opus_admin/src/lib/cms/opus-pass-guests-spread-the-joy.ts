import type { MaybeLocalized } from '@/lib/cms/localized'

export type OpusPassGuestsSpreadIconKey =
  | 'file-down'
  | 'printer'
  | 'share-2'
  | 'clipboard-check'
  | 'mail'
  | 'message-circle'
  | 'send'
  | 'calendar-check'
  | 'users'
  | 'heart'

export const OPUS_PASS_GUESTS_SPREAD_ICONS: { value: OpusPassGuestsSpreadIconKey; label: string }[] = [
  { value: 'file-down', label: 'Download (file)' },
  { value: 'printer', label: 'Printer' },
  { value: 'share-2', label: 'Share' },
  { value: 'clipboard-check', label: 'Clipboard / manage' },
  { value: 'mail', label: 'Mail' },
  { value: 'message-circle', label: 'Message' },
  { value: 'send', label: 'Send' },
  { value: 'calendar-check', label: 'Calendar' },
  { value: 'users', label: 'Guests' },
  { value: 'heart', label: 'Heart' },
]

export type OpusPassGuestsSpreadItem = {
  id: string
  icon: OpusPassGuestsSpreadIconKey
  // Translatable text — stored as { en, sw } (or a legacy plain string).
  title: MaybeLocalized
  description: MaybeLocalized
}

export type OpusPassGuestsSpreadContent = {
  heading: MaybeLocalized
  description: MaybeLocalized
  items: OpusPassGuestsSpreadItem[]
}

export type OpusPassGuestsSpreadRow = {
  id: string
  page_key: string
  section_key: string
  content: OpusPassGuestsSpreadContent
  draft_content: OpusPassGuestsSpreadContent | null
  is_published: boolean
  updated_at: string
}

export const OPUS_PASS_GUESTS_SPREAD_FALLBACK: OpusPassGuestsSpreadContent = {
  heading: 'Endless ways to spread the joy',
  description: 'Design it once, share it everywhere!',
  items: [
    {
      id: 'download',
      icon: 'file-down',
      title: 'Download',
      description: 'Get a digital copy of your invitation by downloading it to your device.',
    },
    {
      id: 'print',
      icon: 'printer',
      title: 'Print',
      description: 'Download a high-quality PDF and print at home, or let us do the printing!',
    },
    {
      id: 'share',
      icon: 'share-2',
      title: 'Share',
      description: 'Spread the word on social media, by text message, or email to friends and family.',
    },
    {
      id: 'manage',
      icon: 'clipboard-check',
      title: 'Manage',
      description: 'Create an online event page to collect RSVPs and manage all the little details!',
    },
  ],
}
