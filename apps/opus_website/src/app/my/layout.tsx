import type { ReactNode } from 'react'
import Navbar from '@/components/navbar'
import Footer from '@/components/footer'

export default function MyLayout({ children }: { children: ReactNode }) {
  return (
    <div className="font-sans bg-[#FAFAF8] text-[#1A1A1A] selection:bg-(--accent) selection:text-(--on-accent) min-h-screen flex flex-col">
      <Navbar />
      <main className="flex-1">{children}</main>
      <Footer />
    </div>
  )
}
