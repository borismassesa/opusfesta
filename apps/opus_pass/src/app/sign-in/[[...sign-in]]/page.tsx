import { SignIn } from '@clerk/nextjs'
import Logo from '@/components/ui/Logo'

export const metadata = { title: 'Sign in — OpusPass' }

export default function SignInPage() {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-gradient-to-b from-[#F3E9FA] via-[#FBF7F2] to-white px-4 py-12">
      <Logo className="mb-6 text-3xl" />
      <SignIn
        signUpUrl="/sign-up"
        fallbackRedirectUrl="/my/dashboard"
      />
    </div>
  )
}
