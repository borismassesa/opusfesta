import { currentUser } from '@clerk/nextjs/server'
import ApprovalsClient from './ApprovalsClient'
import { listApprovalRequests } from './queries'
import type { ApprovalActor } from './types'

export const dynamic = 'force-dynamic'

function initialsFromName(name: string): string {
  const parts = name.trim().split(/\s+/).filter(Boolean)
  if (parts.length === 0) return 'YOU'
  return parts
    .slice(0, 2)
    .map((p) => p[0]!.toUpperCase())
    .join('')
}

export default async function ApprovalsPage() {
  const user = await currentUser()
  const primaryEmail =
    user?.emailAddresses?.find((e) => e.id === user.primaryEmailAddressId)?.emailAddress ??
    user?.emailAddresses?.[0]?.emailAddress ??
    ''
  const displayName =
    user?.fullName?.trim() || user?.firstName?.trim() || primaryEmail || 'You'

  const actor: ApprovalActor = {
    name: displayName,
    email: primaryEmail,
    initials: initialsFromName(displayName),
    color: '#10B981',
  }

  const initialRequests = await listApprovalRequests()

  // The Approvals page heading is driven by ApprovalsClient (it knows
  // whether we're on the dashboard, a category list, or a single
  // request) so the header can render "← Business Trip" etc. when
  // appropriate. No <WorkforceHeading> here — having two heading
  // setters would race.
  return <ApprovalsClient actor={actor} initialRequests={initialRequests} />
}
