import { SignUp } from '@clerk/nextjs'
import { auth } from '@clerk/nextjs/server'
import { redirect } from 'next/navigation'
import AuthShell from '@/components/AuthShell'
import { authAppearance } from '@/components/auth-appearance'

export const metadata = { title: 'Create account — OpusFesta' }

export default async function SignUpPage() {
  // Shared apex session — don't render an empty <SignUp> to an already
  // signed-in visitor; send them home instead.
  const { userId } = await auth()
  if (userId) redirect('/')

  return (
    <AuthShell
      panelTitle="Plan your celebration with OpusFesta"
      panelSubtitle="Discover vendors, manage inquiries and bring your wedding together — all in one place."
    >
      <h1 className="text-[28px] font-bold leading-tight tracking-tight text-[#1A1A1A]">
        Create your account
      </h1>
      <p className="mt-2 text-[15px] text-gray-500">
        Start planning your perfect wedding.
      </p>

      <div className="mt-6">
        <SignUp
          signInUrl="/sign-in"
          forceRedirectUrl="/onboarding"
          appearance={authAppearance}
        />
      </div>
    </AuthShell>
  )
}
