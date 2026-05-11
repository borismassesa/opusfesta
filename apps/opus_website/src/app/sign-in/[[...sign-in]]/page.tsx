import { SignIn } from '@clerk/nextjs'

export default function SignInPage() {
  return (
    <main className="min-h-screen bg-[#FAFAF8] flex flex-col items-center justify-center px-4 py-12">
      <div className="mb-8 text-center">
        <h1 className="text-2xl font-bold text-[#1A1A1A] mb-1">Welcome back</h1>
        <p className="text-sm text-gray-500">Sign in to your OpusFesta account</p>
      </div>
      <SignIn
        appearance={{
          elements: {
            rootBox: 'w-full max-w-md',
            card: 'shadow-none border border-gray-100 rounded-2xl bg-white p-6',
            headerTitle: 'hidden',
            headerSubtitle: 'hidden',
            socialButtonsBlockButton:
              'rounded-xl border border-gray-200 font-semibold text-[#1A1A1A] hover:bg-gray-50',
            dividerLine: 'bg-gray-200',
            dividerText: 'text-gray-400 text-xs',
            formFieldInput:
              'rounded-xl border-gray-200 focus:border-[#1A1A1A] text-sm py-3',
            formButtonPrimary:
              'rounded-full bg-(--accent) hover:bg-(--accent-hover) text-(--on-accent) text-sm font-bold',
            footerActionLink: 'text-[#1A1A1A] font-semibold',
            identityPreviewText: 'text-sm text-gray-600',
            formResendCodeLink: 'text-[#1A1A1A]',
          },
        }}
      />
    </main>
  )
}
