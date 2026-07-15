/**
 * Pure, directive-free helpers shared between the server-side broadcaster
 * (broadcast.ts) and the browser-side subscriber (realtimeClient.ts).
 *
 * Deliberately NOT in realtimeClient.ts: that file is 'use client' (it
 * constructs a browser Supabase client), and Next.js treats a 'use client'
 * module as client-only in its entirety — importing even a pure function
 * from it in a server context throws at runtime ("Attempted to call X()
 * from the server but X is on the client"). Same failure class as a pure
 * util living in a 'server-only' file and breaking client imports, just
 * the mirror image.
 */
export interface CheckinBroadcastPayload {
  status: 'success' | 'duplicate' | 'queued'
  guestName: string
  partySize: number
  doorLabel: string
  at: string
}

export function checkinChannelName(eventId: string): string {
  return `checkin:${eventId}`
}
