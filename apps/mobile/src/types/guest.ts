export type RsvpStatus = 'pending' | 'attending' | 'declined' | 'maybe';

/**
 * A guest as the mobile app consumes it: a `guest_contacts` row flattened
 * together with its `guest_invitations` entry for the couple's default event.
 * Produced by `getGuestList` in src/lib/api/guests.ts.
 */
export interface Guest {
  id: string;
  full_name: string;
  email: string | null;
  phone: string | null;
  group_tag: string | null;
  max_party_size: number | null;
  public_token: string | null;
  last_invited_at: string | null;
  invite_count: number | null;
  rsvp_status: RsvpStatus;
  party_size: number;
  meal_choice: string | null;
  dietary_notes: string | null;
  guest_message: string | null;
  responded_at: string | null;
  invitation_id: string | null;
}
