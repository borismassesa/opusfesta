import type { ReactNode } from 'react'
import { redirect } from 'next/navigation'
import { Sidebar } from '@/components/Sidebar'
import { Header } from '@/components/Header'
import { PageHeadingProvider } from '@/components/PageHeading'
import { PageSearchProvider } from '@/components/PageSearch'
import { getAdminAccessRole } from '@/lib/admin-auth'

export const dynamic = 'force-dynamic'

export default async function AdminLayout({ children }: { children: ReactNode }) {
  const role = await getAdminAccessRole()
  if (!role) redirect('/contribute')

  return (
    <PageHeadingProvider>
      <PageSearchProvider>
        <div className="flex h-screen bg-[#FDFDFD] font-sans antialiased text-gray-900">
          <Sidebar />
          <div className="flex-1 flex flex-col h-screen overflow-hidden">
            <Header />
            <main className="flex-1 overflow-y-auto overflow-x-hidden">
              {children}
            </main>
          </div>
        </div>
      </PageSearchProvider>
    </PageHeadingProvider>
  )
}
