import Link from 'next/link'
import { redirect } from 'next/navigation'
import { auth, currentUser } from '@clerk/nextjs/server'
import { acceptInvitation } from '@/lib/workforce-invitations'

// Landing page for the link in the workforce-invite email. Two phases:
//
//   1. Visitor arrives unauthenticated → bounce them through Clerk
//      sign-up, preserving the token in the redirect_url so we land
//      back here once they've picked a password.
//   2. Visitor arrives authenticated → call acceptInvitation(), which
//      flips workforce_employees.dashboard_access on (and the trigger
//      mirrors them into admin_whitelist). Then redirect to /.
//
// The page intentionally does no UI for happy-path acceptance — it's a
// pure side-effect endpoint. We render a card only on error so the
// invitee sees a clear next step instead of a generic 500.

export const dynamic = 'force-dynamic'

function firstParam(value: string | string[] | undefined): string | null {
  if (Array.isArray(value)) return value[0] ?? null
  return value ?? null
}

export default async function AcceptInvitePage({
  searchParams,
}: {
  searchParams?: Promise<Record<string, string | string[] | undefined>>
}) {
  const params = await searchParams
  const token = firstParam(params?.token)

  if (!token) {
    return (
      <Card
        title="Invitation link is missing its token"
        body="The link you clicked doesn't include the security token. Open the original invite email and click the button again — copy/paste sometimes drops query parameters."
      />
    )
  }

  const { userId } = await auth()
  if (!userId) {
    // Bounce to Clerk's hosted sign-up. Once they finish, Clerk follows
    // redirect_url back to this page where the second branch runs.
    const redirectUrl = `/accept-invite?token=${encodeURIComponent(token)}`
    redirect(`/sign-up?redirect_url=${encodeURIComponent(redirectUrl)}`)
  }

  const user = await currentUser()
  const email =
    user?.primaryEmailAddress?.emailAddress ||
    user?.emailAddresses?.[0]?.emailAddress ||
    ''
  if (!email) {
    return (
      <Card
        title="Couldn't read your email address"
        body="We couldn't read the email on your Clerk account. Sign out and try the invitation link again."
      />
    )
  }

  try {
    await acceptInvitation({
      token,
      clerkUserId: userId,
      clerkEmail: email,
    })
  } catch (err) {
    return (
      <Card
        title="We couldn't accept this invitation"
        body={err instanceof Error ? err.message : 'Unknown error.'}
        retry
      />
    )
  }

  // Success — drop them at the dashboard. The whitelist trigger has
  // already mirrored their access so the (admin) layout will let them in.
  redirect('/')
}

function Card({
  title,
  body,
  retry,
}: {
  title: string
  body: string
  retry?: boolean
}) {
  return (
    <div className="min-h-screen flex items-center justify-center bg-[#FDFDFD] px-4">
      <div className="w-full max-w-md rounded-2xl border border-gray-100 bg-white p-8 shadow-[0_2px_10px_-4px_rgba(0,0,0,0.05)]">
        <h1 className="text-xl font-semibold text-gray-900">{title}</h1>
        <p className="mt-3 text-sm text-gray-600">{body}</p>
        <div className="mt-6 flex gap-2">
          <Link
            href="/"
            className="rounded-lg border border-gray-200 px-3 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50"
          >
            Go to dashboard
          </Link>
          {retry && (
            <p className="text-xs text-gray-500 self-center">
              Or hit refresh once an owner has reissued your invite.
            </p>
          )}
        </div>
      </div>
    </div>
  )
}
