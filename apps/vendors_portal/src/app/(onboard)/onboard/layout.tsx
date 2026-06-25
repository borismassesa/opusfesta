import type { ReactNode } from 'react'
import { redirect } from 'next/navigation'
import { getCurrentVendor } from '@/lib/vendor'

// Gate the onboarding wizard. It is only for users who have NOT yet submitted
// an application — a vendor who already applied must never be dropped back into
// the wizard (e.g. via the sign-up redirect, an OAuth hand-off treated as a
// sign-up, a stale bookmark, or a leftover localStorage draft). Mirrors the
// (portal) layout gate, but in reverse: there `live` gets in, here it's kept
// out.
//
//   - no-application → still applying, let them through
//   - pending-approval + application_in_progress → mid-wizard, let them through
//   - pending-approval (submitted: verification_pending / admin_review /
//     needs_corrections) or suspended → already applied, send to /verify
//   - live → already approved, send to the dashboard
//   - no-env → dev fallback with no Supabase, keep the wizard previewable
export default async function OnboardRouteLayout({
  children,
}: {
  children: ReactNode
}) {
  const state = await getCurrentVendor()

  if (state.kind === 'live') redirect('/dashboard')
  if (state.kind === 'suspended') redirect('/verify')
  if (
    state.kind === 'pending-approval' &&
    state.status !== 'application_in_progress'
  ) {
    // Already submitted (verification_pending / admin_review / needs_corrections)
    // → the /verify status + document hub, not back into the wizard.
    redirect('/verify')
  }

  return <>{children}</>
}
