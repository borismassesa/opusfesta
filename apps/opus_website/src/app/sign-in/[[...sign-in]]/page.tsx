import { SignIn } from '@clerk/nextjs'
import { auth } from '@clerk/nextjs/server'
import { redirect } from 'next/navigation'
import AuthShell from '@/components/AuthShell'
import { authAppearance } from '@/components/auth-appearance'

export const metadata = { title: 'Sign in — OpusFesta' }

export default async function SignInPage() {
  // All *.opusfesta.com apps share one Clerk instance, so a visitor may already
  // have a session (e.g. signed in on OpusPass). Clerk's <SignIn> renders an
  // empty form when a session exists — redirect instead of showing a dead form.
  const { userId } = await auth()
  if (userId) redirect('/')

  return (
    <AuthShell
      panelTitle="Welcome back to OpusFesta"
      panelSubtitle="Plan your wedding, discover vendors and manage every celebration — all from one account."
    >
      <h1 className="text-[28px] font-bold leading-tight tracking-tight text-[#1A1A1A]">
        Sign in to your account
      </h1>
      <p className="mt-2 text-[15px] text-gray-500">
        Welcome back — sign in to continue.
      </p>

      <div className="mt-6">
        <SignIn signUpUrl="/sign-up" appearance={authAppearance} />
      </div>
    </AuthShell>
  )
}
