'use client'

import { useUser } from '@clerk/nextjs'
import { useSetPageHeading } from '@/components/PageHeading'

// Tiny client-only component that pushes "Welcome, <name>" into the
// PageHeading context so the global Header renders the personalised
// greeting. Renders nothing visible — keeps the dashboard page itself
// a server component (the rest of the dashboard is data-driven via
// getDashboardSnapshot()).
//
// Fallback chain: firstName → fullName → email-before-@ → "Welcome".

function welcomeTitle(user: ReturnType<typeof useUser>['user']): string {
  if (!user) return 'Welcome'
  const first = user.firstName?.trim()
  if (first) return `Welcome, ${first}`
  const full = user.fullName?.trim()
  if (full) return `Welcome, ${full}`
  const email =
    user.primaryEmailAddress?.emailAddress ||
    user.emailAddresses?.[0]?.emailAddress
  if (email) return `Welcome, ${email.split('@')[0]}`
  return 'Welcome'
}

export default function DashboardHeading({ subtitle }: { subtitle?: string }) {
  const { user, isLoaded } = useUser()
  useSetPageHeading({
    title: isLoaded ? welcomeTitle(user) : 'Welcome',
    subtitle,
  })
  return null
}
