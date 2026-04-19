import type { ReactNode } from 'react'
import Navbar from '@/components/navbar'

export default function ComingSoonLayout({ children }: { children: ReactNode }) {
  return (
    <div className="flex min-h-svh flex-col bg-[#FFFFFF] font-sans text-[#1A1A1A] selection:bg-[var(--accent)] selection:text-[var(--on-accent)]">
      <Navbar />
      <div className="flex-1">{children}</div>
      <footer className="border-t border-gray-200 bg-white">
        <div className="mx-auto flex max-w-6xl flex-col items-center justify-between gap-3 px-6 py-6 text-xs text-gray-500 sm:flex-row">
          <p>© 2026 OpusFesta. All rights reserved.</p>
          <div className="flex items-center gap-5">
            <a href="#" className="transition-colors hover:text-[#1A1A1A]">Terms of Use</a>
            <a href="#" className="transition-colors hover:text-[#1A1A1A]">Privacy Policy</a>
            <a href="#" className="transition-colors hover:text-[#1A1A1A]">Accessibility</a>
          </div>
        </div>
      </footer>
    </div>
  )
}
