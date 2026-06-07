import { cookies } from 'next/headers'

// ---------------------------------------------------------------------------
// TEMPORARY shared-passcode admin access
// ---------------------------------------------------------------------------
// A single shared "access code" the whole team can use to get into the admin
// dashboard with full `owner` rights — no Clerk sign-in required. This exists
// so work isn't blocked while the production Clerk sign-in is being sorted out.
//
// How it works:
//   • /temp-access asks for the code (see app/temp-access).
//   • On a correct code we set an httpOnly `of_temp_admin` cookie.
//   • admin-auth.ts treats a valid cookie as `owner`; proxy.ts lets it past the
//     Clerk route guard.
//
// It is gated by the shared code (NOT wide open), but it IS a shared password
// that grants full admin — treat it as temporary. Disable it by setting
// ADMIN_TEMP_PASSWORD="" (empty) in the environment, or remove this module.
//
// NOTE: the constant here is duplicated in proxy.ts because middleware runs on
// the edge runtime and can't import this `next/headers` module.

export const TEMP_ADMIN_COOKIE = 'of_temp_admin'

// Default code so it works on a fresh deploy without extra env wiring. Override
// (or disable with an empty string) via ADMIN_TEMP_PASSWORD.
const DEFAULT_TEMP_PASSWORD = 'opusfesta-admin-2026'

export function tempAdminPassword(): string | null {
  // Explicitly-set empty string disables the feature; unset falls back to the
  // default so production works straight after deploy.
  const raw =
    process.env.ADMIN_TEMP_PASSWORD === undefined
      ? DEFAULT_TEMP_PASSWORD
      : process.env.ADMIN_TEMP_PASSWORD
  return raw.length > 0 ? raw : null
}

export function isTempAdminEnabled(): boolean {
  return tempAdminPassword() !== null
}

// Constant-time-ish compare so a wrong code can't be brute-forced by timing.
export function isTempAdminPassword(input: string): boolean {
  const pw = tempAdminPassword()
  if (!pw || input.length !== pw.length) return false
  let mismatch = 0
  for (let i = 0; i < pw.length; i += 1) {
    mismatch |= input.charCodeAt(i) ^ pw.charCodeAt(i)
  }
  return mismatch === 0
}

export async function hasTempAdminAccess(): Promise<boolean> {
  const pw = tempAdminPassword()
  if (!pw) return false
  const jar = await cookies()
  return jar.get(TEMP_ADMIN_COOKIE)?.value === pw
}
