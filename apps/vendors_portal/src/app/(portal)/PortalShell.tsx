'use client'

import type { ReactNode } from 'react'
import { usePathname } from 'next/navigation'
import { Sidebar } from '@/components/Sidebar'
import { Header } from '@/components/Header'
import { StorefrontSidebar } from '@/components/storefront/StorefrontSidebar'

export default function PortalShell({
  children,
  vendorName,
}: {
  children: ReactNode
  vendorName: string
}) {
  const pathname = usePathname()
  const isStorefront = pathname.startsWith('/storefront')

  return (
    <div className="flex h-screen bg-[#FDFDFD] font-sans antialiased text-gray-900">
      <Sidebar />
      {isStorefront ? <StorefrontSidebar /> : null}
      <div className="flex-1 flex flex-col h-screen overflow-hidden">
        <Header vendorName={vendorName} />
        <main className="flex-1 overflow-y-auto overflow-x-hidden">{children}</main>
      </div>
    </div>
  )
}
