import { SignIn } from '@clerk/nextjs'
import Logo from '@/components/ui/Logo'

export const metadata = { title: 'Log in — OpusPass' }

export default function SignInPage() {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-gradient-to-b from-[#F3E9FA] via-[#FBF7F2] to-white px-4 py-12">
      <Logo className="mb-6 text-3xl" />
      <SignIn
        appearance={{ elements: { formButtonPrimary: 'bg-[#C9A0DC] hover:bg-[#b97fd0] text-[#1A1A1A]' } }}
        signUpUrl="/sign-up"
        fallbackRedirectUrl="/my/dashboard"
      />
    </div>
  )
}
