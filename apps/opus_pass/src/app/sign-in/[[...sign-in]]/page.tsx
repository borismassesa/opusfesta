import { SignIn } from '@clerk/nextjs'
import { auth } from '@clerk/nextjs/server'
import { redirect } from 'next/navigation'
import AuthShell from '@/components/AuthShell'
import { authAppearance } from '@/components/auth-appearance'

export const metadata = { title: 'Sign in — OpusPass' }

export default async function SignInPage() {
  // The apex Clerk session is shared, so a visitor may already be signed in
  // (e.g. from opusfesta.com). Clerk's <SignIn> renders an empty form when a
  // session exists — redirect to the dashboard instead of showing a dead form.
  const { userId } = await auth()
  if (userId) redirect('/my/dashboard')

  return (
    <AuthShell
      panelTitle="Welcome back to OpusPass"
      panelSubtitle="Your invitations, wedding website, guest list and live RSVPs — all in one place."
    >
      <h1 className="text-[28px] font-bold leading-tight tracking-tight text-[#1A1A1A]">
        Sign in to your account
      </h1>
      <p className="mt-2 text-[15px] text-gray-500">
        Welcome back — sign in to manage your celebration.
      </p>

      {/*
        routing="hash" is required under basePath '/opuspass' (see next.config.ts).
        Clerk's default "path" routing infers its mount path and navigates to
        sub-paths; that inference doesn't account for the basePath prefix, so the
        component mounts at /opuspass/sign-in but expects /sign-in and hangs on a
        blank/loading state. Hash routing keeps every step on the same URL (#/...)
        and ignores the path. Redirects (signUpUrl, fallbackRedirectUrl) go through
        Clerk's Next router integration, which already respects basePath.

        Same Clerk instance as opus_website + vendors_portal, so this account is
        recognised across the whole OpusFesta ecosystem (shared apex session).
      */}
      <div className="mt-6">
        <SignIn
          routing="hash"
          signUpUrl="/sign-up"
          fallbackRedirectUrl="/my/dashboard"
          appearance={authAppearance}
        />
      </div>
    </AuthShell>
  )
}
