import { auth } from '@clerk/nextjs/server'
import { redirect } from 'next/navigation'
import SignInClient from './SignInClient'

function firstParam(value: string | string[] | undefined): string | null {
  if (Array.isArray(value)) return value[0] ?? null
  return value ?? null
}

function safeLocalRedirect(value: string | null): string | undefined {
  if (!value) return undefined
  if (!value.startsWith('/') || value.startsWith('//')) return undefined
  return value
}

export default async function SignInPage({
  searchParams,
}: {
  searchParams?: Promise<Record<string, string | string[] | undefined>>
}) {
  const params = await searchParams
  const redirectUrl = safeLocalRedirect(
    firstParam(params?.redirect_url) || firstParam(params?.redirectUrl)
  )

  // The apex Clerk session is shared across *.opusfesta.com, so a visitor may
  // already be signed in (e.g. from OpusPass). Don't render the sign-in form —
  // it would show "You're already signed in" and a 400. Send them onward; the
  // (admin) layout gates on admin_whitelist and bounces non-staff to /contribute.
  const { userId } = await auth()
  if (userId) redirect(redirectUrl || '/')

  return <SignInClient redirectUrl={redirectUrl} />
}
