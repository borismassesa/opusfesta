/**
 * Thin fetch wrappers around apps/opus_scanner's three API routes
 * (/api/access/resolve, /api/access/validate, /api/checkin). The web app
 * called these inline with relative fetch('/api/...') since it's the same
 * origin; this app has no origin of its own, so every call needs the full
 * base URL of wherever that Next.js app is deployed.
 */
function baseUrl(): string {
  const url = process.env.EXPO_PUBLIC_SCANNER_API_BASE_URL
  if (!url) throw new Error('Missing EXPO_PUBLIC_SCANNER_API_BASE_URL')
  return url.replace(/\/$/, '')
}

async function post<T>(path: string, body: unknown): Promise<T> {
  const res = await fetch(`${baseUrl()}${path}`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
  })
  return (await res.json()) as T
}

export interface RosterEntry {
  qrToken: string
  invitationId: string
  guestContactId: string
  fullName: string
  partySize: number
  checkedInAt: string | null
  /** The couple's real guest-list grouping (e.g. "Bride's Family") — free
   * text, not an enum. */
  groupTag: string | null
  /** Heuristic only: true when the couple literally wrote "VIP" somewhere
   * in the group tag — there's no dedicated VIP/General tier field. */
  isVip: boolean
}

export interface ResolveCodeResponse {
  ok: boolean
  eventId?: string
  error?: string
}

export function resolveAccessCode(token: string): Promise<ResolveCodeResponse> {
  return post('/api/access/resolve', { token })
}

export interface ValidateAccessResponse {
  ok: boolean
  error?: string
  doorLabel?: string
  /** Non-null when an admin assigned this code to a named attendant at
   * issuance — authoritative, the login screen must skip the name step. */
  attendantName?: string | null
  event?: { id: string; name: string; event_type: string }
  roster?: RosterEntry[]
}

export function validateAccess(eventId: string, token: string): Promise<ValidateAccessResponse> {
  return post('/api/access/validate', { eventId, token })
}

export interface CheckinResponse {
  status: 'success' | 'duplicate' | 'invalid' | 'error' | 'queued'
  message?: string
  guestName?: string
  partySize?: number
  checkedInAt?: string | null
  isVip?: boolean
  groupTag?: string | null
}

export interface CheckinRequest {
  eventId: string
  accessToken: string
  doorLabel: string
  qrToken: string
  attendantName: string
  manualReason?: string
}

export function submitCheckin(req: CheckinRequest): Promise<CheckinResponse> {
  return post('/api/checkin', req)
}
