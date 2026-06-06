import { currentUser } from '@clerk/nextjs/server'
import AccountProfile from './AccountProfile'

export const dynamic = 'force-dynamic'

export default async function SettingsPage() {
  const user = await currentUser()

  const account = {
    name:
      [user?.firstName, user?.lastName].filter(Boolean).join(' ') ||
      user?.username ||
      'Your account',
    email:
      user?.primaryEmailAddress?.emailAddress ??
      user?.emailAddresses[0]?.emailAddress ??
      '',
    imageUrl: user?.hasImage ? user.imageUrl : null,
  }

  return <AccountProfile account={account} />
}
