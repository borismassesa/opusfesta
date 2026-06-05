import { redirect } from 'next/navigation'
import { auth } from '@clerk/nextjs/server'
import SetPasswordClient from './SetPasswordClient'

export const dynamic = 'force-dynamic'

// Forced first-sign-in password reset for accounts provisioned with a
// temporary password. Lives OUTSIDE the (admin) route group so the layout's
// "must reset" gate can redirect here without looping. Requires a signed-in
// session; the actual reset happens client-side via Clerk.
export default async function SetPasswordPage() {
  const { userId } = await auth()
  if (!userId) redirect('/sign-in')
  return <SetPasswordClient />
}
