import { SignUp } from '@clerk/nextjs'
import AuthShell from '@/components/AuthShell'
import { authAppearance } from '@/components/auth-appearance'

export const metadata = { title: 'Sign up — OpusPass' }

export default function SignUpPage() {
  return (
    <AuthShell
      panelTitle="Plan your celebration with OpusPass"
      panelSubtitle="Beautiful digital invitations, a free wedding website, live RSVPs and a gift registry — everything for your big day, in one account."
    >
      <h1 className="text-[28px] font-bold leading-tight tracking-tight text-[#1A1A1A]">
        Create your account
      </h1>
      <p className="mt-2 text-[15px] text-gray-500">
        One account for your invitations, wedding website, and RSVPs.
      </p>

      {/*
        routing="hash" is required under basePath '/opuspass' — see the matching
        note on the sign-in page. Same shared Clerk instance as the rest of the
        OpusFesta ecosystem, so a couple who signs up here is recognised on
        opusfesta.com too.
      */}
      <div className="mt-6">
        <SignUp
          routing="hash"
          signInUrl="/sign-in"
          fallbackRedirectUrl="/my/dashboard"
          appearance={authAppearance}
        />
      </div>
    </AuthShell>
  )
}
