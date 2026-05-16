import { auth } from '@clerk/nextjs/server'
import { redirect } from 'next/navigation'
import GuestsClient from './GuestsClient'

export const dynamic = 'force-dynamic'

export default async function MyGuestsPage() {
  const { userId } = await auth()
  if (!userId) redirect('/sign-in?redirect_url=/my/guests')

  return <GuestsClient />
}
