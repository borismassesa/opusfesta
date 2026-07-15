import 'server-only'
import { createScannerClient } from './supabase'
import { checkinChannelName, type CheckinBroadcastPayload } from './broadcastShared'

/**
 * Best-effort live-attendance broadcast, sent after a check-in is already
 * durably written by checkin_guest_invitation(). This is a UI enhancement
 * only (multi-door "recent activity" feed + the organizer live dashboard in
 * opus_pass) — it must never block or fail the check-in response, so every
 * failure mode here is swallowed.
 */
export async function broadcastCheckin(eventId: string, payload: CheckinBroadcastPayload): Promise<void> {
  const supabase = createScannerClient()
  const channel = supabase.channel(checkinChannelName(eventId))

  try {
    await Promise.race([
      new Promise<void>((resolve) => {
        channel.subscribe((status) => {
          if (status === 'SUBSCRIBED') resolve()
        })
      }),
      new Promise<void>((resolve) => setTimeout(resolve, 1200)),
    ])
    await channel.send({ type: 'broadcast', event: 'scan', payload })
  } catch {
    // best-effort — the check-in itself already succeeded before this runs
  } finally {
    await supabase.removeChannel(channel)
  }
}
