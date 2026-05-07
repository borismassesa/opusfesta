import type { ReactNode } from 'react'
import Navbar from '@/components/navbar'
import Footer from '@/components/footer'
import { MySidebarNav, MyMobileNav } from './MyNav'

export default function MyLayout({ children }: { children: ReactNode }) {
  return (
    <div className="font-sans bg-[#FAFAF8] text-[#1A1A1A] selection:bg-(--accent) selection:text-(--on-accent) min-h-screen flex flex-col">
      <Navbar />
      <div className="flex flex-1">
        <MySidebarNav />
        <div className="flex-1 min-w-0 flex flex-col">
          <MyMobileNav />
          <main className="flex-1">{children}</main>
        </div>
      </div>
      <Footer />
    </div>
  )
}
