import { SignIn } from '@clerk/nextjs'

export default function SignInPage() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-[#FDFDFD] px-4">
      <SignIn
        fallbackRedirectUrl="/dashboard"
        appearance={{
          elements: {
            formButtonPrimary: 'bg-[#C9A0DC] hover:bg-[#b97fd0] text-[#1A1A1A]',
          },
        }}
      />
    </div>
  )
}
