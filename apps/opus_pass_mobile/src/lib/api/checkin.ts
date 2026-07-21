import { publicOrigin } from '@/lib/share';
import type {
  CheckinScanResult,
  ResolveCodeResult,
  ValidateSessionResult,
} from '@/types/checkin';

/**
 * Client for the door-scanner check-in API, served by apps/opus_pass
 * (`/api/checkin/*`) rather than Supabase directly.
 *
 * This deliberately does NOT talk to Supabase like the rest of this app's
 * data layer. Verifying an entry pass requires CHECKIN_TOKEN_SECRET, and a
 * secret shipped inside an app bundle can be extracted and used to forge
 * passes — so all verification stays server-side and the app only relays
 * what it scanned. It also means the access code, not the couple's Clerk
 * session, is what authorizes a scan, which is what lets hired staff scan
 * without an account.
 */

function checkinUrl(path: string): string {
  return `${publicOrigin()}/api/checkin/${path}`;
}

async function postJson<T>(path: string, body: unknown): Promise<T> {
  const url = checkinUrl(path);

  let response: Response;
  try {
    response = await fetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body),
    });
  } catch {
    // The request never landed: wrong network, server down, or a URL the
    // device can't route to. Naming the host is the whole point here — the
    // usual cause is the app pointing somewhere it can't reach, and a
    // generic "check your connection" hides exactly the detail needed.
    throw new Error(`Can't reach ${hostOf(url)}. Check the network and that the server is running.`);
  }

  // These endpoints return a JSON body on failure too (401 for an expired
  // code, etc.), and that body carries the message worth showing the
  // attendant — so read it before deciding the request failed.
  const raw = await response.text().catch(() => '');
  try {
    return JSON.parse(raw) as T;
  } catch {
    // Reached a server, but not this API: almost always a 404 HTML page from
    // an origin where these routes aren't deployed.
    throw new Error(
      `${hostOf(url)} returned ${response.status}, not check-in data. Is the check-in API deployed there?`
    );
  }
}

/** Host (and port) of a URL, for error messages — the full path adds noise. */
function hostOf(url: string): string {
  const match = /^https?:\/\/([^/]+)/.exec(url);
  return match ? match[1] : url;
}

/** Exchange a typed access code for the event it belongs to. */
export function resolveAccessCode(token: string): Promise<ResolveCodeResult> {
  return postJson<ResolveCodeResult>('resolve', { token: token.trim() });
}

/** Confirm the access code is still valid and fetch the event + guest roster. */
export function validateScannerSession(
  eventId: string,
  token: string
): Promise<ValidateSessionResult> {
  return postJson<ValidateSessionResult>('validate', { eventId, token });
}

export interface SubmitScanInput {
  eventId: string;
  accessToken: string;
  /** The raw scanned QR string. Omit for a manual override. */
  qrToken?: string;
  /** Manual override: admit a guest picked from the roster. Needs manualReason. */
  invitationId?: string;
  /** Manual override by the short code printed on the ticket. Needs manualReason. */
  entryCode?: string;
  manualReason?: string;
  /** How many of the party actually arrived. Server defaults to the full party. */
  checkedInPartySize?: number;
  doorLabel?: string;
  attendantName?: string;
}

export function submitScan(input: SubmitScanInput): Promise<CheckinScanResult> {
  return postJson<CheckinScanResult>('scan', input);
}

export interface AmendPartySizeInput {
  eventId: string;
  accessToken: string;
  qrToken?: string;
  invitationId?: string;
  checkedInPartySize: number;
  doorLabel?: string;
}

/**
 * Correct how many of an already-admitted party actually arrived.
 *
 * Separate from submitScan because check-in is first-scan-wins — re-scanning
 * a pass reports a duplicate and will not rewrite the headcount. See
 * apps/opus_pass/src/app/api/checkin/amend/route.ts.
 */
export function amendPartySize(input: AmendPartySizeInput): Promise<CheckinScanResult> {
  return postJson<CheckinScanResult>('amend', input);
}
