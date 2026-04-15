import { SignIn } from '@clerk/nextjs'
import Image from 'next/image'
import Link from 'next/link'

export default function SignInPage() {
  return (
    <main
      className="min-h-screen bg-[#FDFBF7] flex flex-col items-center justify-center p-6"
      style={{ fontFamily: 'var(--font-sans)' }}
    >
      <div className="w-full max-w-[420px] flex flex-col items-center">

        {/* Header */}
        <Link href="/" className="group flex flex-col items-center gap-4 mb-12">
          <div className="relative flex h-[72px] w-[72px] items-center justify-center transition-transform duration-500 group-hover:scale-105">
            <Image
              src="/studio-logo.png"
              alt="OpusStudio"
              width={40}
              height={47}
              unoptimized
              className="object-contain opacity-90 group-hover:opacity-100 transition-opacity duration-500"
              priority
            />
          </div>
          <div className="flex flex-col items-center gap-1">
            <span className="text-[10px] uppercase font-mono tracking-[0.4em] text-[#8A7662]">OpusStudio</span>
            <span className="text-xs uppercase tracking-[0.35em] text-[#171717] font-light">Operations Center</span>
          </div>
        </Link>

        {/* Clerk SignIn component */}
        <SignIn
          path="/sign-in"
          routing="path"
          fallbackRedirectUrl="/studio-admin"
          appearance={{
            elements: {
              rootBox: 'w-full',
              card: 'w-full shadow-none border border-[#171717]/10 rounded-none bg-transparent p-8',
              headerTitle: 'text-[#171717] font-semibold text-xl tracking-tight',
              headerSubtitle: 'text-[#8A7662] text-sm',
              formFieldLabel: 'text-[10px] uppercase tracking-[0.25em] text-[#8A7662]',
              formFieldInput: 'border-0 border-b border-[#171717]/20 rounded-none bg-transparent focus:border-[#171717] focus:ring-0 text-sm text-[#171717]',
              formButtonPrimary: 'bg-[#171717] hover:bg-[#171717]/80 text-white text-[11px] uppercase tracking-[0.3em] rounded-none h-[52px] transition-colors duration-300',
              spinner: 'hidden',
              formButtonPrimary__loading: 'clerk-btn-loading',
              footerActionLink: 'text-[#8A7662] hover:text-[#171717]',
              identityPreviewText: 'text-[#171717]',
              identityPreviewEditButton: 'text-[#8A7662]',
              dividerLine: 'bg-[#171717]/10',
              dividerText: 'text-[#8A7662] text-xs',
              socialButtonsBlockButton: 'border border-[#171717]/15 rounded-none hover:border-[#171717]/40 transition-colors text-[#171717] text-xs',
              alertText: 'text-red-600 text-sm',
            },
          }}
        />

        <p className="mt-10 text-[9px] uppercase tracking-[0.4em] font-mono text-[#171717]/40">
          &copy; {new Date().getFullYear()} OpusStudio Operations
        </p>
      </div>
    </main>
  )
}
