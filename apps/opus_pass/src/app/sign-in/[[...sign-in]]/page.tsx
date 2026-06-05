import { SignIn } from '@clerk/nextjs'
import Logo from '@/components/ui/Logo'

export const metadata = { title: 'Sign in — OpusPass' }

export default function SignInPage() {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-gradient-to-b from-[#F3E9FA] via-[#FBF7F2] to-white px-4 py-12">
      <Logo className="mb-6 text-3xl" />
      {/*
        routing="hash" is required because the app runs under basePath '/opuspass'
        (see next.config.ts). Clerk's default "path" routing infers its mount path
        and navigates to sub-paths; that inference doesn't account for the basePath
        prefix, so the component mounts at /opuspass/sign-in but expects /sign-in and
        hangs on a blank/loading state. Hash routing keeps every step on the same URL
        (#/...) and ignores the path. See the matching note on the sign-up page.
      */}
      <SignIn
        routing="hash"
        signUpUrl="/sign-up"
        fallbackRedirectUrl="/my/dashboard"
      />
    </div>
  )
}
