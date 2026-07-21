export type RsvpStatus = 'pending' | 'attending' | 'declined' | 'maybe';

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
  | 'other';

export const EVENT_TYPE_LABELS: Record<EventType, string> = {
  wedding: 'Wedding',
  send_off: 'Sendoff',
  kitchen_party: 'Kitchen party',
  save_the_date: 'Save the date',
  kadi_za_michango: 'Kadi za michango',
  anniversary: 'Anniversary',
  communio: 'Communio',
  birthday: 'Birthday',
  gala_dinner: 'Gala dinner',
  muslim_wedding: 'Muslim wedding',
  other: 'Event',
};

export interface WeddingEvent {
  id: string;
  name: string;
  event_type: EventType;
  venue_name: string | null;
  address: string | null;
  city: string | null;
  starts_at: string | null;
  ends_at: string | null;
  sort_order: number;
  /** Whether guests can RSVP to this event from the public RSVP page. */
  allow_rsvp: boolean;
}

/** The subset of WeddingEvent a couple edits by hand. */
export type WeddingEventDraft = Pick<
  WeddingEvent,
  'name' | 'event_type' | 'venue_name' | 'address' | 'city' | 'starts_at' | 'allow_rsvp'
>;

export interface GuestInvitation {
  id: string;
  guest_contact_id: string;
  event_id: string;
  rsvp_status: RsvpStatus;
  party_size: number;
  meal_choice: string | null;
  responded_at: string | null;
}

export interface GuestContact {
  id: string;
  full_name: string;
  email: string | null;
  phone: string | null;
  whatsapp_phone: string | null;
  group_tag: string | null;
  max_party_size: number;
  notes: string | null;
}

/** The fields the add/edit-guest form writes. */
export type GuestContactDraft = Omit<GuestContact, 'id'>;

export type RsvpQuestionKind = 'short_answer' | 'multiple_choice';

export interface RsvpQuestionOption {
  id: string;
  label: string;
  description?: string;
}

export interface RsvpQuestion {
  id: string;
  /** NULL = a "general" question asked to everyone who RSVPs. */
  event_id: string | null;
  prompt: string;
  description: string | null;
  kind: RsvpQuestionKind;
  required: boolean;
  /** Only ask this when the guest is attending (Knot "follow-up" semantics). */
  attending_only: boolean;
  options: RsvpQuestionOption[];
  sort_order: number;
}

export interface GuestWithInvitations extends GuestContact {
  invitations: GuestInvitation[];
}

export interface DashboardStats {
  totalGuests: number;
  invitedGuests: number;
  attending: number;
  declined: number;
  maybe: number;
  pending: number;
  expectedHeadcount: number;
  /** 0-100 */
  responseRate: number;
  mealBreakdown: { choice: string; count: number }[];
}

export interface CoupleProfileLite {
  partner1_name: string | null;
  partner2_name: string | null;
  wedding_date: string | null;
  public_slug: string | null;
  cover_image_url: string | null;
  public_sharing_enabled: boolean;
}

/** Mirrors apps/opus_pass/src/lib/dashboard/queries.ts `coupleFirstNames()`. */
function firstNameOf(fullName: string | null): string | null {
  if (!fullName) return null;
  return fullName.trim().split(/\s+/)[0] ?? null;
}

export function coupleFirstNames(profile: CoupleProfileLite | null): string {
  if (!profile) return 'The Couple';
  const names = [profile.partner1_name, profile.partner2_name]
    .map(firstNameOf)
    .filter((name): name is string => Boolean(name));
  if (names.length === 0) return 'The Couple';
  return names.join(' & ');
}
