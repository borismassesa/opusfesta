import type { ReactNode } from 'react'
import Navbar from '@/components/navbar'
import VendorsFooterGate from '@/components/vendors/VendorsFooterGate'

export default function VendorsLayout({ children }: { children: ReactNode }) {
  return (
    <div className="font-sans bg-[#FFFFFF] text-[#1A1A1A] selection:bg-[var(--accent)] selection:text-[var(--on-accent)]">
      <Navbar />
      {children}
      <VendorsFooterGate />
    </div>
  )
}
