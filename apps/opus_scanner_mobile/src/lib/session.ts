import * as SecureStore from 'expo-secure-store'

/** Port of apps/opus_scanner's lib/session.ts — same shape, SecureStore instead of localStorage. */
export interface ScannerSession {
  eventId: string
  accessToken: string
  doorLabel: string
  eventName: string
  /** Who's actually holding this device — set once per shift via the
   * attendant-name step in the event-login screen, separate from the
   * door-level access token so swapping staff mid-event doesn't require a
   * fresh QR/link. */
  attendantName: string
  /** True when attendantName came from an admin-assigned code, not a
   * self-typed name — the "who's scanning?" step and "switch attendant"
   * option are both skipped/hidden in that case; the code IS the identity. */
  attendantAssigned?: boolean
}

function key(eventId: string) {
  return `opus-scanner-session-${eventId}`
}

// expo-secure-store has no synchronous API (unlike localStorage) — every
// call site awaits these instead of reading inline during render.
export async function readSession(eventId: string): Promise<ScannerSession | null> {
  try {
    const raw = await SecureStore.getItemAsync(key(eventId))
    return raw ? (JSON.parse(raw) as ScannerSession) : null
  } catch {
    return null
  }
}

export async function writeSession(session: ScannerSession): Promise<void> {
  await SecureStore.setItemAsync(key(session.eventId), JSON.stringify(session))
}

/** Clear just the attendant identity (e.g. shift change) — keeps the
 * device's door-level access token so they don't need the QR link again. */
export async function clearAttendant(eventId: string): Promise<void> {
  const session = await readSession(eventId)
  if (!session) return
  await writeSession({ ...session, attendantName: '' })
}
