import { getGuestbookEntries, getMyPublicInvite } from '@/lib/dashboard/queries'
import GuestbookClient from './GuestbookClient'

export const dynamic = 'force-dynamic'

export const metadata = {
  title: 'Guestbook',
}

export default async function GuestbookPage() {
  const [entries, invite] = await Promise.all([getGuestbookEntries(), getMyPublicInvite()])
  // The link is built client-side from window.location.origin (see
  // ShareLinkCard) rather than publicOrigin() here, so it resolves to
  // localhost while developing instead of always pointing at production.
  return <GuestbookClient initial={entries} shareSlug={invite.slug} shareEnabled={invite.enabled} />
}
