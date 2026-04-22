import type { ReactNode } from 'react'
import Navbar from '@/components/navbar'
import Footer from '@/components/footer'

export default function AdviceIdeasLayout({ children }: { children: ReactNode }) {
  return (
    <div className="flex min-h-svh flex-col bg-white font-sans text-[#1A1A1A] selection:bg-[var(--accent)] selection:text-[var(--on-accent)]">
      <Navbar />
      <div className="flex-1">{children}</div>
      <Footer
        showVendorMessagingSection={false}
        showVendorDiscoverySection={false}
        showIdeasAdviceColumn={false}
      />
    </div>
  )
}
