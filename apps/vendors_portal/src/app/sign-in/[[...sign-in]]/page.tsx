import { SignIn } from '@clerk/nextjs'
import AuthShell from '@/components/AuthShell'

export default function SignInPage() {
  return (
    <AuthShell
      panelTitle="Welcome back to OpusFesta"
      panelSubtitle="Pick up right where you left off — your leads, bookings, and storefront, all in one place."
    >
      <SignIn
        forceRedirectUrl="/dashboard"
        fallbackRedirectUrl="/dashboard"
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
