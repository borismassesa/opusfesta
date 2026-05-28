export type EventType =
  | 'ceremony'
  | 'reception'
  | 'engagement'
  | 'rehearsal'
  | 'send_off'
  | 'other'

export type RsvpStatus = 'pending' | 'attending' | 'declined' | 'maybe'

export type SendChannel = 'whatsapp' | 'sms' | 'email' | 'link'

export interface WeddingEvent {
  id: string
  name: string
  event_type: EventType
  description: string | null
  venue_name: string | null
  address: string | null
  city: string | null
  starts_at: string | null
  ends_at: string | null
  dress_code: string | null
  collect_meal_choice: boolean
  meal_options: string[]
  /** Show this event on the public wedding website. */
  is_public: boolean
  /** Let guests RSVP to this event directly from the wedding website. */
  allow_rsvp: boolean
  sort_order: number
  created_at: string
  updated_at: string
}

export interface ChildEntry {
  first_name: string
  last_name: string
}

export interface GuestContact {
  id: string
  full_name: string
  title: string | null
  first_name: string | null
  last_name: string | null
  suffix: string | null

  plus_one_title: string | null
  plus_one_first_name: string | null
  plus_one_last_name: string | null
  plus_one_suffix: string | null
  plus_one_name_unknown: boolean

  children: ChildEntry[]

  email: string | null
  phone: string | null
  whatsapp_phone: string | null
  group_tag: string | null
  max_party_size: number
  notes: string | null

  name_on_envelope: string | null
  address_country: string | null
  address_line1: string | null
  address_apt: string | null
  address_city: string | null
  address_region: string | null
  address_postal_code: string | null

  public_token: string
  last_invited_at: string | null
  invite_count: number
  created_at: string
  updated_at: string
}

export interface GuestInvitation {
  id: string
  guest_contact_id: string
  event_id: string
  rsvp_status: RsvpStatus
  party_size: number
  meal_choice: string | null
  dietary_notes: string | null
  guest_message: string | null
  responded_at: string | null
  created_at: string
  updated_at: string
}

/** A guest row enriched with their invitations for dashboard tables. */
export interface GuestWithInvitations extends GuestContact {
  invitations: GuestInvitation[]
}

export interface DashboardStats {
  totalGuests: number
  invitedGuests: number
  attending: number
  declined: number
  maybe: number
  pending: number
  expectedHeadcount: number
  responseRate: number // 0-100
  mealBreakdown: { choice: string; count: number }[]
}

export const EVENT_TYPE_LABELS: Record<EventType, string> = {
  ceremony: 'Ceremony',
  reception: 'Reception',
  engagement: 'Engagement',
  rehearsal: 'Rehearsal',
  send_off: 'Send-off',
  other: 'Other',
}

export const RSVP_STATUS_LABELS: Record<RsvpStatus, string> = {
  pending: 'Awaiting reply',
  attending: 'Attending',
  declined: 'Declined',
  maybe: 'Maybe',
}

