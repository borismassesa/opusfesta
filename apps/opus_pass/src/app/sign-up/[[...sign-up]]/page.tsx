import { SignUp } from '@clerk/nextjs'
import Logo from '@/components/ui/Logo'

export const metadata = { title: 'Sign up — OpusPass' }

export default function SignUpPage() {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-gradient-to-b from-[#F3E9FA] via-[#FBF7F2] to-white px-4 py-12">
      <Logo className="mb-6 text-3xl" />
      {/*
        routing="hash" is required because the app runs under basePath '/opuspass'
        (see next.config.ts). Clerk's default "path" routing infers its mount path
        and navigates to sub-paths (e.g. /sign-up/verify-email-address); that path
        inference doesn't account for the basePath prefix, so the component mounts
        at /opuspass/sign-up but expects /sign-up and hangs on a blank/loading state.
        Hash routing keeps every step on the same URL (#/...) and ignores the path,
        sidestepping the prefix entirely. Redirects (signInUrl, fallbackRedirectUrl)
        go through Clerk's Next router integration, which already respects basePath.
      */}
      <SignUp
        routing="hash"
        signInUrl="/sign-in"
        fallbackRedirectUrl="/my/dashboard"
      />
    </div>
  )
}
