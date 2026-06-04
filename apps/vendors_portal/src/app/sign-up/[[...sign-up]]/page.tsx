import { SignUp } from '@clerk/nextjs'
import AuthShell from '@/components/AuthShell'

export default function SignUpPage() {
  return (
    <AuthShell
      panelTitle="Grow your business with OpusFesta"
      panelSubtitle="List your services, reach couples planning their big day, and manage every booking — leads, quotes, and payments — from one dashboard."
    >
      <SignUp
        forceRedirectUrl="/onboard"
        fallbackRedirectUrl="/onboard"
        appearance={{
          elements: {
            rootBox: 'w-full',
            cardBox: 'w-full shadow-none border-0',
            card: 'shadow-none border-0 bg-transparent p-0 w-full',
            headerTitle:
              'text-[28px] font-bold leading-tight tracking-tight text-[#1A1A1A]',
            headerSubtitle: 'text-[15px] text-gray-500',
            formButtonPrimary:
              'bg-[#1A1A1A] hover:bg-black text-white normal-case',
          },
        }}
      />
    </AuthShell>
  )
}
