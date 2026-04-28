export type InboxSource =
  | 'booking_inquiry'
  | 'vendor_application'
  | 'review_flag'
  | 'client_support'
  | 'vendor_support'
  | 'payout_dispute'
  | 'refund_request'
  | 'system_alert'

export type InboxStatus = 'new' | 'open' | 'in_progress' | 'resolved' | 'archived'

export type InboxPriority = 'low' | 'normal' | 'high' | 'urgent'

export type InboxRole = 'client' | 'vendor' | 'system'

export type InboxSender = {
  name: string
  handle?: string
  role: InboxRole
  avatarColor: string
  initials: string
}

export type InboxAttachmentKind =
  | 'image'
  | 'pdf'
  | 'doc'
  | 'sheet'
  | 'slide'
  | 'audio'
  | 'video'
  | 'archive'
  | 'other'

export type InboxAttachment = {
  id: string
  name: string
  kind: InboxAttachmentKind
  mime?: string
  size: number
  url?: string
  thumbUrl?: string
}

export type InboxMessage = {
  id: string
  from: InboxSender
  at: string
  body: string
  internal?: boolean
  attachments?: InboxAttachment[]
}

export type InboxRelated = {
  type: 'booking' | 'vendor' | 'review' | 'payout' | 'refund' | 'client'
  id: string
  label: string
}

export type InboxItem = {
  id: string
  source: InboxSource
  subject: string
  preview: string
  sender: InboxSender
  receivedAt: string
  status: InboxStatus
  priority: InboxPriority
  assignee: string | null
  unread: boolean
  starred: boolean
  tags: string[]
  related?: InboxRelated
  thread: InboxMessage[]
}

export type SourceMeta = {
  key: InboxSource
  label: string
  accent: string
  tint: string
  text: string
}
