import { createClient, type SupabaseClient } from '@supabase/supabase-js'

export type { CheckinBroadcastPayload } from './broadcastShared'
export { checkinChannelName } from './broadcastShared'

/**
 * Port of apps/opus_scanner's lib/realtimeClient.ts — anon key only, used
 * exclusively for Realtime Broadcast (never table reads/writes, which stay
 * server-only on the web app this talks to). EXPO_PUBLIC_ prefix instead of
 * NEXT_PUBLIC_ so Expo inlines these at build time.
 */
export function createRealtimeClient(): SupabaseClient {
  const url = process.env.EXPO_PUBLIC_SUPABASE_URL
  const key = process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY
  if (!url || !key) throw new Error('Missing EXPO_PUBLIC_SUPABASE_URL or EXPO_PUBLIC_SUPABASE_ANON_KEY')
  return createClient(url, key, { auth: { persistSession: false } })
}
