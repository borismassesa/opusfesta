import Link from 'next/link'
import type { ReactNode } from 'react'
import Logo from '@/components/ui/Logo'

export const dynamic = 'force-dynamic'

export default function ContributorLayout({ children }: { children: ReactNode }) {
  return (
    <div className="min-h-screen bg-[#FDFDFD] text-gray-900">
      <header className="border-b border-gray-100 bg-white">
        <div className="mx-auto flex max-w-[1200px] items-center justify-between px-6 py-4">
          <Link href="/contribute/articles" aria-label="Contributor workspace">
            <Logo className="h-7 w-auto" />
          </Link>
          <span className="rounded-full bg-[#F0DFF6] px-3 py-1 text-xs font-bold uppercase tracking-[0.16em] text-[#7E5896]">
            Contributor
          </span>
        </div>
      </header>
      <main>{children}</main>
    </div>
  )
}
