import type { ReactNode } from 'react'
import { redirect } from 'next/navigation'
import AdminSidebar from '@/components/admin/layout/AdminSidebar'
import AdminTopbar from '@/components/admin/layout/AdminTopbar'
import { getCurrentStudioAccess } from '@/lib/admin-auth'

export const metadata = {
  title: 'Admin | OpusStudio',
}

export default async function AdminLayout({ children }: { children: ReactNode }) {
  const { userId, role: studioRole } = await getCurrentStudioAccess()

  if (!userId) redirect('/sign-in')
  if (!studioRole) redirect('/no-access')

  return (
    <div className="admin-shell flex h-screen">
      <AdminSidebar role={studioRole} />
      <div className="flex-1 flex flex-col overflow-hidden">
        <AdminTopbar />
        <main className="flex-1 overflow-y-auto p-6 lg:p-8">
          {children}
        </main>
      </div>
    </div>
  )
}
