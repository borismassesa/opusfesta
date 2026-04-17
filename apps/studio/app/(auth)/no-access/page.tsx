import Link from 'next/link'
import Image from 'next/image'
import { SignOutButton } from '@clerk/nextjs'

export default function NoAccessPage() {
  return (
    <main
      className="min-h-screen bg-[#FDFBF7] flex flex-col items-center justify-center p-6 text-center"
      style={{ fontFamily: 'var(--font-sans)' }}
    >
      <div className="max-w-sm flex flex-col items-center gap-8">
        <Link href="/">
          <Image src="/studio-logo.png" alt="OpusStudio" width={40} height={47} unoptimized className="opacity-80" />
        </Link>

        <div className="space-y-3">
          <p className="text-[10px] uppercase tracking-[0.4em] text-[#8A7662]">Access Restricted</p>
          <h1 className="text-2xl font-semibold text-[#171717] tracking-tight">No admin access</h1>
          <p className="text-sm text-[#8A7662] leading-relaxed">
            Your account does not have permission to access the OpusStudio admin panel.
            Contact your administrator to request access.
          </p>
        </div>

        <div className="flex flex-col items-center gap-3 w-full">
          <SignOutButton redirectUrl="/">
            <button className="w-full h-[52px] bg-[#171717] text-white text-[11px] uppercase tracking-[0.3em] hover:bg-[#171717]/80 transition-colors">
              Sign out
            </button>
          </SignOutButton>
          <Link
            href="/"
            className="text-[10px] uppercase tracking-[0.3em] text-[#8A7662] hover:text-[#171717] transition-colors"
          >
            Back to site
          </Link>
        </div>
      </div>
    </main>
  )
}
