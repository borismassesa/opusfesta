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
  /** 'host' (added by the couple) | 'public' (self-registered via /i/<slug>). */
  source: GuestSource
  /** 'confirmed' | 'unconfirmed' (public self-RSVP awaiting host approval). */
  review_status: GuestReviewStatus
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
