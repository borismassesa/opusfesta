'use server'

import { auth, clerkClient } from '@clerk/nextjs/server'

const MIN_LENGTH = 8

export type CompletePasswordResetResult =
  | { ok: true }
  | { ok: false; error: string }

// Completes the forced first-sign-in reset for a temp-password account.
//
// Runs ENTIRELY server-side and atomically: Clerk changes the password
// (its backend updateUser still enforces the instance policy — length,
// complexity, breach — so weak/pwned passwords are rejected here exactly as
// the client widget would), and ONLY on success do we clear the
// `mustResetPassword` gate flag. A previous version cleared the flag from a
// separate client-trusted call, which let a temp-password user clear the gate
// WITHOUT ever changing the password — leaving the admin-issued temp password
// live. Tying both to one server call closes that.
//
// Gated on the caller actually being a `mustResetPassword` account so this
// can't double as a generic "change my password" endpoint.
export async function completePasswordReset(
  newPassword: string,
): Promise<CompletePasswordResetResult> {
  const { userId } = await auth()
  if (!userId) return { ok: false, error: 'Not signed in.' }
  if (typeof newPassword !== 'string' || newPassword.length < MIN_LENGTH) {
    return { ok: false, error: `Use at least ${MIN_LENGTH} characters.` }
  }

  const clerk = await clerkClient()
  const user = await clerk.users.getUser(userId)
  if (user.publicMetadata?.mustResetPassword !== true) {
    // Not a temp-password account (or already reset). Treat as success so a
    // double-submit or stale tab doesn't surface a scary error.
    return { ok: true }
  }

  try {
    // NB: we deliberately do NOT pass signOutOfOtherSessions here. From the
    // Backend API there's no "current" session to preserve, so it would sign
    // the caller out entirely and bounce them to /sign-in mid-reset. The
    // password change is the security boundary; the temp password is now dead.
    await clerk.users.updateUser(userId, { password: newPassword })
  } catch (err) {
    const detail =
      err && typeof err === 'object' && 'errors' in err
        ? (err as { errors?: Array<{ longMessage?: string; message?: string }> })
            .errors?.[0]
        : null
    return {
      ok: false,
      error: detail?.longMessage || detail?.message || 'Could not update your password.',
    }
  }

  // Password provably changed — now clear the gate. Passing null removes just
  // this key; role / workforceRoleId stay intact (Clerk merges top-level keys).
  await clerk.users.updateUserMetadata(userId, {
    publicMetadata: { mustResetPassword: null },
  })

  return { ok: true }
}
