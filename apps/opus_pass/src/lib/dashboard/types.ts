export type EventType =
  | 'wedding'
  | 'send_off'
  | 'kitchen_party'
  | 'save_the_date'
  | 'kadi_za_michango'
  | 'anniversary'
  | 'communio'
  | 'birthday'
  | 'gala_dinner'
  | 'muslim_wedding'
  | 'other'

export type RsvpStatus = 'pending' | 'attending' | 'declined' | 'maybe'

export type SendChannel = 'whatsapp' | 'sms' | 'email' | 'link'

/** How a guest entered the roster. 'public' = self-registered via /i/<slug>. */
export type GuestSource = 'host' | 'public'

/** Review state for a guest. 'unconfirmed' = a public self-RSVP awaiting the host. */
export type GuestReviewStatus = 'confirmed' | 'unconfirmed'

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
  /** 'host' (added by the couple) | 'public' (self-registered via /i/<slug>). */
  source: GuestSource
  /** 'confirmed' | 'unconfirmed' (public self-RSVP awaiting host approval). */
  review_status: GuestReviewStatus
  last_invited_at: string | null
  invite_count: number
  /** Separate from the wedding-invite tracker above — the pledge ask is a
   *  different send with its own status. NULL sent_at = never asked. */
  pledge_invite_sent_at: string | null
  pledge_invite_count: number
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
  /** Last time this guest was sent a thank-you message for THIS event. NULL = never sent. */
  thank_you_sent_at: string | null
  thank_you_count: number
  created_at: string
  updated_at: string
}

/** A guest row enriched with their invitations for dashboard tables. */
export interface GuestWithInvitations extends GuestContact {
  invitations: GuestInvitation[]
}

// ──────────────────────────────────── Guestbook ─────────────────────────────────

/** 'pending' = a guest-submitted message awaiting host moderation. */
export type GuestbookReviewStatus = 'pending' | 'approved' | 'hidden'

/** Self-selected relation to the couple, shown as a byline on the public wall. */
export type GuestbookRelation = 'Family' | 'Friend' | 'Colleague'

export const GUESTBOOK_RELATIONS: GuestbookRelation[] = ['Family', 'Friend', 'Colleague']

export interface GuestbookEntry {
  id: string
  guest_name: string
  message: string
  photo_url: string | null
  video_url: string | null
  audio_url: string | null
  relation: GuestbookRelation | null
  review_status: GuestbookReviewStatus
  reviewed_at: string | null
  /** Which of the couple's wedding_events this message is for — null only for pre-events legacy rows. */
  event_id: string | null
  created_at: string
  updated_at: string
}

export const GUESTBOOK_STATUS_LABELS: Record<GuestbookReviewStatus, string> = {
  pending: 'Needs review',
  approved: 'Approved',
  hidden: 'Hidden',
}

// ─────────────────────────────── Gift registry ──────────────────────────────────

export const GIFT_REGISTRY_CATEGORIES = [
  'Kitchen',
  'Tabletop',
  'Bed & Bath',
  'Home',
  'Weekend',
  'Experiences & Gift Cards',
] as const

export type GiftRegistryCategory = (typeof GIFT_REGISTRY_CATEGORIES)[number]

export interface GiftRegistryItem {
  id: string
  title: string
  description: string | null
  /** Ordered gallery — the first photo is the card's default cover. */
  image_urls: string[]
  /** One optional short clip of the gift. */
  video_url: string | null
  /** Free text, e.g. "TZS 250,000" or "Any amount" — not a fixed currency amount. */
  price_label: string | null
  /** Optional URL to the actual product a guest can buy from (online alternative to the shop fields below). */
  product_link: string | null
  /** Physical shop/vendor where this gift can be bought — Tanzania-first: most gifts are bought in person, not shipped. */
  shop_name: string | null
  /** Free-text address/area for shop_name. */
  shop_location: string | null
  /** Phone/WhatsApp number for shop_name. */
  shop_contact: string | null
  /** One of GIFT_REGISTRY_CATEGORIES, or null if uncategorized. */
  category: string | null
  /** How many of this gift the couple is asking for (e.g. a set of 2). */
  quantity_requested: number
  /** Highlighted as a top priority on both the dashboard and the public page. */
  most_wanted: boolean
  /** Flagged as something guests can coordinate to give together (no pooled payments — just a hint). */
  group_gift: boolean
  /** A cash fund (honeymoon, house deposit, etc.) rather than a physical gift — claiming still works the same, this is just categorization. */
  is_cash_fund: boolean
  /** Which of the couple's wedding_events this gift is for — null only for pre-events legacy rows. */
  event_id: string | null
  claimed_by_name: string | null
  /** Only set for quantity_requested <= 1 — multi-unit claimants live in gift_registry_claims instead. */
  claimed_by_phone: string | null
  claimed_by_email: string | null
  claimed_at: string | null
  sort_order: number
  created_at: string
  updated_at: string
}

// ──────────────────────────────── RSVP questions ────────────────────────────────

/** Short answer (skippable) or multiple choice (guest must pick an option). */
export type RsvpQuestionKind = 'short_answer' | 'multiple_choice'

/** One selectable answer for a multiple-choice question. */
export interface RsvpQuestionOption {
  id: string
  label: string
  description: string | null
}

export interface RsvpQuestion {
  id: string
  /** NULL = a "general" question asked to everyone; set = a per-event follow-up. */
  event_id: string | null
  prompt: string
  description: string | null
  kind: RsvpQuestionKind
  required: boolean
  /** Only ask when the guest is attending (ignored for general questions). */
  attending_only: boolean
  options: RsvpQuestionOption[]
  sort_order: number
  created_at: string
  updated_at: string
}

/** A guest's answer to one question, captured during their RSVP. */
export interface RsvpAnswer {
  id: string
  guest_invitation_id: string
  question_id: string
  answer_text: string | null
  option_id: string | null
  created_at: string
  updated_at: string
}

export const RSVP_QUESTION_KIND_LABELS: Record<RsvpQuestionKind, string> = {
  short_answer: 'Short answer',
  multiple_choice: 'Multiple choice',
}

/** When/how a guest was last contacted (latest send), for the RSVP tracker. */
export interface LastSend {
  channel: SendChannel
  at: string
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
  wedding: 'Wedding',
  send_off: 'Sendoff',
  kitchen_party: 'Kitchen party',
  save_the_date: 'Save the date',
  kadi_za_michango: 'Kadi za michango',
  anniversary: 'Anniversary',
  communio: 'Communio',
  birthday: 'Birthday',
  gala_dinner: 'Gala Dinner',
  muslim_wedding: 'Muslim Wedding',
  other: 'Other',
}

/**
 * Display label for a stored `event_type`. Known types map to their label;
 * a custom "Other" value (free text typed by the couple) is shown verbatim.
 */
export function eventTypeLabel(value: string): string {
  return EVENT_TYPE_LABELS[value as EventType] ?? value
}

/** Swahili noun form used in the WhatsApp invite body ("...kuhudhuria {category} ya..."). */
export const EVENT_TYPE_LABELS_SW: Record<EventType, string> = {
  wedding: 'harusi',
  send_off: 'sendoff',
  kitchen_party: 'kitchen party',
  save_the_date: 'save the date',
  kadi_za_michango: 'kadi za michango',
  anniversary: 'kumbukumbu ya ndoa',
  communio: 'komunyo',
  birthday: 'siku ya kuzaliwa',
  gala_dinner: 'gala dinner',
  muslim_wedding: 'harusi ya kiislamu',
  other: 'sherehe',
}

/** Swahili display label for a stored `event_type`, for the WhatsApp template's {{3}}. */
export function eventTypeLabelSw(value: string): string {
  return EVENT_TYPE_LABELS_SW[value as EventType] ?? 'sherehe'
}

export const RSVP_STATUS_LABELS: Record<RsvpStatus, string> = {
  pending: 'Awaiting reply',
  attending: 'Attending',
  declined: 'Declined',
  maybe: 'Maybe',
}

// ──────────────────────────────── Seat collection ────────────────────────────────

/** A table on an event's floor plan. */
export interface SeatingTable {
  id: string
  event_id: string
  name: string
  capacity: number
  /** The "Top table" — rendered first with a star, for the head party. */
  is_head: boolean
  sort_order: number
  created_at: string
  updated_at: string
}

/**
 * An attending guest party for one event, with where they're seated.
 * `seats` is the headcount they occupy (their confirmed RSVP party_size).
 * `table_id` is null when the guest is still in the "to be seated" pool.
 */
export interface SeatableGuest {
  guest_contact_id: string
  full_name: string
  seats: number
  meal_choice: string | null
  dietary_notes: string | null
  group_tag: string | null
  table_id: string | null
}

/** Everything the seating planner needs for a single event. */
export interface SeatingData {
  event: WeddingEvent
  tables: SeatingTable[]
  guests: SeatableGuest[]
}

// ──────────────────────────────── Pledges ("michango") ────────────────────────────────

export type PledgeStatus = 'invited' | 'pledged' | 'partial' | 'paid' | 'declined'
export type CardStatus = 'none' | 'preparing' | 'prepared' | 'sent'
export type AttendanceAnswer = 'yes' | 'no' | 'maybe'
export type ReminderCadence = 'none' | 'weekly' | 'biweekly'
export type PaymentMethod =
  | 'mpesa'
  | 'tigopesa'
  | 'airtel'
  | 'halopesa'
  | 'cash'
  | 'bank'
  | 'other'

export interface EventPledge {
  id: string
  guest_contact_id: string
  /** Which wedding_event this pledge is for. NULL only on legacy rows created before the couple had any events. */
  event_id: string | null
  pledged_amount: number
  amount_received: number
  currency: string
  promised_date: string | null
  status: PledgeStatus
  payment_method: PaymentMethod | null
  will_attend: AttendanceAnswer | null
  card_status: CardStatus
  reminder_cadence: ReminderCadence
  next_reminder_at: string | null
  last_reminded_at: string | null
  reminder_count: number
  notes: string | null
  created_at: string
  updated_at: string
}

/** A pledge enriched with the contributor's contact details for dashboard rows. */
export interface PledgeWithContact extends EventPledge {
  full_name: string
  email: string | null
  phone: string | null
  whatsapp_phone: string | null
  group_tag: string | null
  /** The contributor's personal RSVP token (so we can deep-link their RSVP). */
  public_token: string
}

export interface PledgeStats {
  totalPledges: number
  totalPledged: number
  totalReceived: number
  outstanding: number
  paidCount: number
  attendingCount: number
  cardsToPrepare: number
}

export const PLEDGE_STATUS_LABELS: Record<PledgeStatus, string> = {
  invited: 'Awaiting pledge',
  pledged: 'Pledged',
  partial: 'Partly paid',
  paid: 'Paid',
  declined: 'Declined',
}

export const CARD_STATUS_LABELS: Record<CardStatus, string> = {
  none: 'No card yet',
  preparing: 'Preparing',
  prepared: 'Ready',
  sent: 'Sent',
}

export const ATTENDANCE_LABELS: Record<AttendanceAnswer, string> = {
  yes: 'Coming',
  no: 'Not coming',
  maybe: 'Maybe',
}

export const CADENCE_LABELS: Record<ReminderCadence, string> = {
  none: 'No reminders',
  weekly: 'Weekly',
  biweekly: 'Every 2 weeks',
}

export const PAYMENT_METHOD_LABELS: Record<PaymentMethod, string> = {
  mpesa: 'M-Pesa',
  tigopesa: 'Tigo Pesa',
  airtel: 'Airtel Money',
  halopesa: 'HaloPesa',
  cash: 'Cash',
  bank: 'Bank transfer',
  other: 'Other',
}
