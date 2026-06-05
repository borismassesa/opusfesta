// Pure payout types + helpers. This module deliberately has NO 'use client'
// directive and no React/browser dependencies so it can be imported from both
// client components AND server code (e.g. the `submit.ts` server action).
//
// These used to live in `./draft`, but that module is `'use client'` (it owns
// the `useOnboardingDraft` hook). Importing a *value* from a client module into
// a server module makes Turbopack emit a client reference, which throws at
// runtime: "Attempted to call hasCompletePayout() from the server...". Keeping
// the pure helpers here keeps both sides happy.

export type PayoutMethod =
  | 'mpesa'
  | 'airtel-money'
  | 'tigopesa'
  | 'halopesa'
  | 'lipa-namba'
  | 'bank'
  | null

// A single payout destination. Vendors can register several (e.g. an M-Pesa
// number for fast deposits plus a bank account for the balance) and mark one
// as `primary` — the default destination money is sent to.
export type PayoutEntry = {
  id: string
  method: PayoutMethod
  number: string
  accountName: string
  bankName: string // when method === 'bank'
  network: string // when method === 'lipa-namba'
  primary: boolean
}

/** Stable id for a payout entry. crypto.randomUUID where available. */
export function newPayoutEntryId(): string {
  if (typeof crypto !== 'undefined' && typeof crypto.randomUUID === 'function') {
    return crypto.randomUUID()
  }
  return `pe-${Date.now().toString(36)}-${Math.floor(Math.random() * 1e9).toString(36)}`
}

/** A blank payout entry for the onboarding UI to fill in. */
export function emptyPayoutEntry(primary = false): PayoutEntry {
  return {
    id: newPayoutEntryId(),
    method: null,
    number: '',
    accountName: '',
    bankName: '',
    network: '',
    primary,
  }
}

/** Is this entry filled in enough to persist? */
export function isPayoutEntryComplete(e: PayoutEntry): boolean {
  if (!e.method) return false
  if (!e.number.trim() || !e.accountName.trim()) return false
  if (e.method === 'bank' && !e.bankName.trim()) return false
  if (e.method === 'lipa-namba' && !e.network.trim()) return false
  return true
}

// The helpers below only need the payout list, so they accept the structural
// subset rather than the full `OnboardingDraft` — that keeps this module free of
// a dependency on the (client) draft module while still accepting a draft.
type WithPayouts = { payoutMethods: PayoutEntry[] }

/** Does the draft have at least one usable payout method? */
export function hasCompletePayout(draft: WithPayouts): boolean {
  return draft.payoutMethods.some(isPayoutEntryComplete)
}

/** The primary entry (explicitly flagged, else the first). */
export function primaryPayoutEntry(draft: WithPayouts): PayoutEntry | null {
  return (
    draft.payoutMethods.find((e) => e.primary) ?? draft.payoutMethods[0] ?? null
  )
}
