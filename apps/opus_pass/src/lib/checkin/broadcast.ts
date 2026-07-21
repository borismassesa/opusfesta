import 'server-only'
import { createSupabaseServerClient } from '@/lib/supabase'
import { checkinChannelName, type CheckinBroadcastPayload } from './shared'

/**
 * Best-effort live-attendance broadcast, sent only after a check-in has
 * already been durably written by checkin_guest_invitation().
 *
 * This is a UI enhancement (the admin console's live feed, the couple's live
 * attendance view) — never a source of truth. A realtime failure must not
 * turn a successful check-in into an error at the door, so every failure
 * mode here is swallowed and the 1.2s race caps how long a guest waits on
 * the attendant's screen if the socket is slow to come up.
 *
 * Ported from apps/opus_scanner/src/lib/broadcast.ts; the channel/event names
 * must stay identical so existing subscribers work unchanged.
 */
export async function broadcastCheckin(
  eventId: string,
  payload: CheckinBroadcastPayload
): Promise<void> {
  const supabase = createSupabaseServerClient()
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
