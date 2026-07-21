/**
 * Pure, directive-free helpers shared between the server-side broadcaster
 * (broadcast.ts, 'server-only') and any client-side subscriber.
 *
 * Deliberately kept free of both 'server-only' and 'use client': Next.js
 * treats either directive as poisoning the whole module for the other
 * environment, so a pure helper living in one of them breaks imports from
 * the other. This mirrors apps/opus_scanner/src/lib/broadcastShared.ts —
 * the channel name and payload shape MUST stay byte-identical across the
 * two apps, since the admin console subscribes to the same channel
 * regardless of which app published the event.
 */

export interface CheckinBroadcastPayload {
  status: 'success' | 'duplicate' | 'queued'
  guestName: string
  /** Headcount actually admitted at the door (not necessarily what they RSVP'd for). */
  partySize: number
  doorLabel: string
  at: string
}

export function checkinChannelName(eventId: string): string {
  return `checkin:${eventId}`
}
