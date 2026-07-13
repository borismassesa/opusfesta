export interface ScannerSession {
  eventId: string
  accessToken: string
  doorLabel: string
  eventName: string
  /** Who's actually holding this device — set once per shift via the
   * attendant-name step in EventLogin, separate from the door-level access
   * token so swapping staff mid-event doesn't require a fresh QR/link. */
  attendantName: string
  /** True when attendantName came from an admin-assigned code, not a
   * self-typed name — the "who's scanning?" step and "switch attendant"
   * option are both skipped/hidden in that case; the code IS the identity. */
  attendantAssigned?: boolean
}

function key(eventId: string) {
  return `opus-scanner:session:${eventId}`
}

export function readSession(eventId: string): ScannerSession | null {
  if (typeof window === 'undefined') return null
  try {
    const raw = window.localStorage.getItem(key(eventId))
    return raw ? (JSON.parse(raw) as ScannerSession) : null
  } catch {
    return null
  }
}

export function writeSession(session: ScannerSession): void {
  if (typeof window === 'undefined') return
  window.localStorage.setItem(key(session.eventId), JSON.stringify(session))
}

/** Clear just the attendant identity (e.g. shift change) — keeps the
 * device's door-level access token so they don't need the QR link again. */
export function clearAttendant(eventId: string): void {
  const session = readSession(eventId)
  if (!session) return
  writeSession({ ...session, attendantName: '' })
}
