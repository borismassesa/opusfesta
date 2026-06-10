'use client'

import type { ReactNode } from 'react'
import { usePathname } from 'next/navigation'
import { Sidebar } from '@/components/Sidebar'
import { Header } from '@/components/Header'
import { StorefrontSidebar } from '@/components/storefront/StorefrontSidebar'
import type { VendorBusiness } from '@/lib/vendor'

export default function PortalShell({
  children,
  vendorName,
  vendorSlug,
  businesses,
  activeVendorId,
}: {
  children: ReactNode
  vendorName: string
  vendorSlug: string | null
  businesses: VendorBusiness[]
  activeVendorId: string | null
}) {
  const pathname = usePathname()
  const isStorefront = pathname.startsWith('/storefront')

  return (
    <div className="flex h-screen bg-[#FDFDFD] font-sans antialiased text-gray-900">
      <Sidebar />
      {isStorefront ? <StorefrontSidebar vendorSlug={vendorSlug} /> : null}
      <div className="flex-1 flex flex-col h-screen overflow-hidden">
        <Header
          vendorName={vendorName}
          vendorSlug={vendorSlug}
          businesses={businesses}
          activeVendorId={activeVendorId}
        />
        <main className="flex-1 overflow-y-auto overflow-x-hidden">{children}</main>
      </div>
    </div>
  )
}
