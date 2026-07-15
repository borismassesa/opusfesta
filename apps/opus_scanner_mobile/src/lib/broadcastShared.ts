/** Port of apps/opus_scanner's lib/broadcastShared.ts — identical shape,
 * kept in its own file for the same reason as the web app: the channel-name
 * helper and payload type need to be importable from anywhere without
 * pulling in a platform-specific client. */
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
